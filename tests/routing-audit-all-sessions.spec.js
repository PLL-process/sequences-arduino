const fs = require("node:fs");
const { expect, test } = require("@playwright/test");

const viewports = [
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 412, height: 915 }
];

const expectedConnections = new Map([
  [1, 7],
  [2, 9],
  [3, 9],
  [4, 11],
  [5, 15],
  [6, 9],
  [7, 12],
  [8, 15]
]);

const expectedNodes = new Map([
  [1, 7],
  [2, 8],
  [3, 8],
  [4, 9],
  [5, 12],
  [6, 8],
  [7, 10],
  [8, 12]
]);

const expectedAudit = {
  ok: true,
  missingConnections: 0,
  missingArrowheads: 0,
  invalidDecisionInputs: 0,
  invalidDecisionOutputs: 0,
  decisionBottomOutputs: 0,
  reversedDecisionLabels: 0,
  ordinarySideEntries: 0,
  ordinarySideExits: 0,
  zeroLengthSegments: 0,
  blockCollisions: 0,
  nodeOverlaps: 0,
  labelCollisions: 0,
  edgeCrossings: 0,
  ambiguousCrossings: 0,
  foldedSegments: 0,
  danglingConnectors: 0,
  sideEntries: 0,
  sideExits: 0
};

test.describe("algorithm routing audit", () => {
  for (const viewport of viewports) {
    test(`uses lateral decision exits and top target entries at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);

      for (const [sessionId, connectionCount] of expectedConnections.entries()) {
        await page.goto(`/seance-${sessionId}.html`);

        const card = page.locator(`.algorithm-premium-card[data-session='${sessionId}']`);
        const svg = card.locator("svg.algorithm-premium-svg");

        await expect(svg).toBeVisible();
        await expect(svg).toHaveAttribute("data-routing-audit", "ok");
        await expect(svg.locator(".algorithm-svg-title,.algorithm-svg-subtitle")).toHaveCount(0);
        await expect(svg.locator(".algorithm-node")).toHaveCount(expectedNodes.get(sessionId));
        await expect(svg.locator(".algorithm-layout-connectors path.algorithm-connector")).toHaveCount(connectionCount);

        const audit = await svg.evaluate(svgElement => {
          const number = value => Number.parseFloat(value || "0") || 0;
          const close = (first, second, tolerance = 0.5) =>
            Math.abs(first.x - second.x) <= tolerance && Math.abs(first.y - second.y) <= tolerance;

          const parsePoints = d => {
            const numbers = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map(match => Number(match[0]));
            const points = [];
            for (let index = 0; index < numbers.length; index += 2) {
              points.push({ x: numbers[index], y: numbers[index + 1] });
            }
            return points;
          };

          const shapeBox = node => {
            const shape = node.querySelector(".algorithm-node-shape");
            const transform = node.transform.baseVal.consolidate()?.matrix;
            const dx = transform?.e || 0;
            const dy = transform?.f || 0;

            if (shape.tagName.toLowerCase() === "rect") {
              const x = number(shape.getAttribute("x")) + dx;
              const y = number(shape.getAttribute("y")) + dy;
              const width = number(shape.getAttribute("width"));
              const height = number(shape.getAttribute("height"));
              return {
                left: x,
                right: x + width,
                top: y,
                bottom: y + height,
                centerX: x + width / 2,
                centerY: y + height / 2,
                isDecision: false
              };
            }

            const points = (shape.getAttribute("points") || "")
              .trim()
              .split(/\s+/)
              .map(pair => {
                const [x, y] = pair.split(",").map(number);
                return { x: x + dx, y: y + dy };
              });
            const left = Math.min(...points.map(point => point.x));
            const right = Math.max(...points.map(point => point.x));
            const top = Math.min(...points.map(point => point.y));
            const bottom = Math.max(...points.map(point => point.y));
            return {
              left,
              right,
              top,
              bottom,
              centerX: (left + right) / 2,
              centerY: (top + bottom) / 2,
              isDecision: true
            };
          };

          const boxesOverlap = (first, second) =>
            Math.max(first.left, second.left) < Math.min(first.right, second.right) &&
            Math.max(first.top, second.top) < Math.min(first.bottom, second.bottom);

          const segmentCrossesBox = (first, second, box) => {
            if (first.x === second.x) {
              const low = Math.min(first.y, second.y);
              const high = Math.max(first.y, second.y);
              return first.x > box.left && first.x < box.right &&
                Math.max(low, box.top) < Math.min(high, box.bottom);
            }
            if (first.y === second.y) {
              const low = Math.min(first.x, second.x);
              const high = Math.max(first.x, second.x);
              return first.y > box.top && first.y < box.bottom &&
                Math.max(low, box.left) < Math.min(high, box.right);
            }
            return false;
          };

          const nodeBoxes = new Map([...svgElement.querySelectorAll(".algorithm-node")]
            .map(node => [node.dataset.node, shapeBox(node)]));

          const blockOverlaps = [];
          const boxEntries = [...nodeBoxes.entries()];
          for (let firstIndex = 0; firstIndex < boxEntries.length; firstIndex += 1) {
            for (let secondIndex = firstIndex + 1; secondIndex < boxEntries.length; secondIndex += 1) {
              const [firstId, firstBox] = boxEntries[firstIndex];
              const [secondId, secondBox] = boxEntries[secondIndex];
              if (boxesOverlap(firstBox, secondBox)) blockOverlaps.push(`${firstId}/${secondId}`);
            }
          }

          const pathFailures = [];
          const decisionOutputs = new Map();
          const decisionInputs = new Map();

          [...svgElement.querySelectorAll(".algorithm-layout-connectors path.algorithm-connector")].forEach(path => {
            const sourceId = path.dataset.source;
            const targetId = path.dataset.target;
            const source = nodeBoxes.get(sourceId);
            const target = nodeBoxes.get(targetId);
            const points = parsePoints(path.getAttribute("d") || "");
            const first = points[0];
            const second = points[1];
            const last = points[points.length - 1];
            const previous = points[points.length - 2];
            const edgeName = `${sourceId}->${targetId}`;
            const marker = path.getAttribute("marker-end") || "";

            if (!marker.includes("algorithmArrow") && !marker.includes("algorithmLoopArrow")) {
              pathFailures.push(`${edgeName}: missing marker`);
            }

            if (!first || !second || !last || !previous) {
              pathFailures.push(`${edgeName}: incomplete path`);
              return;
            }

            if (source.isDecision) {
              const branch = path.dataset.decisionBranch;
              if (!["yes", "no"].includes(branch)) pathFailures.push(`${edgeName}: missing decision branch`);
              decisionOutputs.set(sourceId, [...(decisionOutputs.get(sourceId) || []), { branch, points }]);

              const expectedStart = branch === "yes"
                ? { x: source.left, y: source.centerY }
                : { x: source.right, y: source.centerY };
              const direction = branch === "yes" ? -1 : 1;

              if (!close(first, expectedStart)) pathFailures.push(`${edgeName}: decision lateral port`);
              if (first.y >= source.bottom - 0.5 || Math.abs(first.x - source.centerX) <= 0.5) {
                pathFailures.push(`${edgeName}: decision bottom output`);
              }
              if (second.y !== first.y) pathFailures.push(`${edgeName}: decision first segment not horizontal`);
              if ((second.x - first.x) * direction <= 0) pathFailures.push(`${edgeName}: reversed decision output`);
            } else {
              if (Math.abs(first.x - source.centerX) > 0.5 || first.y < source.bottom) {
                pathFailures.push(`${edgeName}: source bottom port`);
              }
              if (second.x !== first.x || second.y < first.y) pathFailures.push(`${edgeName}: first segment`);
            }

            if (target.isDecision) decisionInputs.set(targetId, (decisionInputs.get(targetId) || 0) + 1);

            if (Math.abs(last.x - target.centerX) > 0.5 || last.y > target.top) {
              pathFailures.push(`${edgeName}: target top port`);
            }
            if (previous.x !== last.x || previous.y > last.y) pathFailures.push(`${edgeName}: last segment`);
            if (Math.min(Math.abs(last.x - target.left), Math.abs(last.x - target.right)) <= 2) {
              pathFailures.push(`${edgeName}: side target`);
            }

            for (const [nodeId, box] of nodeBoxes.entries()) {
              if (nodeId === sourceId || nodeId === targetId) continue;
              for (let index = 0; index < points.length - 1; index += 1) {
                if (segmentCrossesBox(points[index], points[index + 1], box)) {
                  pathFailures.push(`${edgeName}: crosses ${nodeId}`);
                  break;
                }
              }
            }
          });

          for (const [nodeId, box] of nodeBoxes.entries()) {
            if (!box.isDecision) continue;
            const outputs = decisionOutputs.get(nodeId) || [];
            const branches = outputs.map(output => output.branch);
            if ((decisionInputs.get(nodeId) || 0) !== 1) pathFailures.push(`${nodeId}: decision input count`);
            if (outputs.length !== 2 || !branches.includes("yes") || !branches.includes("no")) {
              pathFailures.push(`${nodeId}: decision output count`);
            }

            const yes = outputs.find(output => output.branch === "yes");
            const no = outputs.find(output => output.branch === "no");
            if (yes && no) {
              if (close(yes.points[0], no.points[0])) pathFailures.push(`${nodeId}: common decision stem`);
              if (yes.points[1]?.x >= yes.points[0]?.x) pathFailures.push(`${nodeId}: yes exits right`);
              if (no.points[1]?.x <= no.points[0]?.x) pathFailures.push(`${nodeId}: no exits left`);

              const hasBottomStem = output =>
                output.points[0]?.x === box.centerX ||
                (output.points[0]?.x === output.points[1]?.x && output.points[1]?.y >= box.bottom);
              const hasUnderDecisionBar = output => output.points.some((point, index) => {
                if (index === 0) return false;
                const previous = output.points[index - 1];
                return previous.y === point.y &&
                  previous.y >= box.bottom &&
                  previous.y <= box.bottom + 45 &&
                  Math.min(previous.x, point.x) <= box.left &&
                  Math.max(previous.x, point.x) >= box.right;
              });

              if ((hasUnderDecisionBar(yes) || hasUnderDecisionBar(no)) && (hasBottomStem(yes) || hasBottomStem(no))) {
                pathFailures.push(`${nodeId}: under-diamond decision bar`);
              }
            }
          }

          const labelOverlaps = [];
          const renderedNodes = [...svgElement.querySelectorAll(".algorithm-node .algorithm-node-shape")].map(shape => {
            const box = shape.getBoundingClientRect();
            return {
              node: shape.closest(".algorithm-node").dataset.node,
              left: box.left,
              right: box.right,
              top: box.top,
              bottom: box.bottom
            };
          });
          [...svgElement.querySelectorAll(".algorithm-branch-label")].forEach(label => {
            const box = label.getBoundingClientRect();
            const labelBox = {
              left: box.left,
              right: box.right,
              top: box.top,
              bottom: box.bottom
            };
            renderedNodes.forEach(nodeBox => {
              if (boxesOverlap(labelBox, nodeBox)) labelOverlaps.push(`${label.textContent.trim()}->${nodeBox.node}`);
            });
          });

          return {
            summary: JSON.parse(svgElement.dataset.routingAuditSummary || "{}"),
            blockOverlaps,
            pathFailures,
            labelOverlaps
          };
        });

        expect(audit.summary, `session ${sessionId} routing summary`).toMatchObject({
          ...expectedAudit,
          connectionCount
        });
        expect(audit.blockOverlaps, `session ${sessionId} block overlaps`).toEqual([]);
        expect(audit.pathFailures, `session ${sessionId} path failures`).toEqual([]);
        expect(audit.labelOverlaps, `session ${sessionId} label overlaps`).toEqual([]);

        await card.scrollIntoViewIfNeeded();
        await card.locator(".algorithm-premium-stage").evaluate(stage => {
          const svg = stage.querySelector("svg.algorithm-premium-svg");
          const box = svg.getBoundingClientRect();
          stage.scrollLeft = Math.max(0, (box.width - stage.clientWidth) / 2);
        });
        await page.screenshot({
          path: `test-results/routing-audit-session-${sessionId}-${viewport.width}x${viewport.height}.png`,
          fullPage: true
        });
      }
    });
  }

  test("keeps modes, animation, SVG download and print actions working", async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.addInitScript(() => {
      window.__printCalls = 0;
      window.print = () => {
        window.__printCalls += 1;
        window.dispatchEvent(new Event("afterprint"));
      };
    });

    for (const sessionId of expectedConnections.keys()) {
      await page.goto(`/seance-${sessionId}.html`);
      const card = page.locator(`.algorithm-premium-card[data-session='${sessionId}']`);
      await expect(card.locator("svg.algorithm-premium-svg")).toHaveAttribute("data-routing-audit", "ok");

      for (const level of ["guided", "supported", "autonomous"]) {
        await card.locator(`[data-level="${level}"]`).click();
        await expect(card).toHaveAttribute("data-level", level);
        await expect(card.locator(`[data-level="${level}"]`)).toHaveAttribute("aria-pressed", "true");
        await expect(card.locator("svg.algorithm-premium-svg")).toHaveAttribute("data-routing-audit", "ok");
        await expect(card.locator(".algorithm-layout-connectors path.algorithm-connector")).toHaveCount(expectedConnections.get(sessionId));
      }

      await card.locator('[data-algorithm-action="play"]').click();
      await expect(card).toHaveClass(/is-playing/);
      await expect.poll(
        () => card.evaluate(element => element.classList.contains("is-playing")),
        { message: `session ${sessionId} animation completes`, timeout: 10000 }
      ).toBe(false);

      const [download] = await Promise.all([
        page.waitForEvent("download"),
        card.locator('[data-algorithm-action="download"]').click()
      ]);
      expect(download.suggestedFilename()).toContain(`seance-${sessionId}`);
      const downloadedPath = await download.path();
      const downloadedSvg = fs.readFileSync(downloadedPath, "utf8");
      expect(downloadedSvg).toContain("marker-end");
      expect(downloadedSvg).toContain("algorithmArrow");

      await card.locator('[data-algorithm-action="print"]').click();
      await expect.poll(
        () => page.evaluate(() => window.__printCalls),
        { message: `session ${sessionId} print call`, timeout: 1000 }
      ).toBeGreaterThan(0);
    }
  });
});
