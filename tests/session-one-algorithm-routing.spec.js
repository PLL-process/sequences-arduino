const { expect, test } = require("@playwright/test");

const viewports = [
  { width: 1280, height: 800 },
  { width: 768, height: 1024 },
  { width: 412, height: 915 }
];

const mainEdges = [
  ["start", "setup"],
  ["setup", "read"],
  ["read", "display"],
  ["display", "safe"],
  ["safe", "wait"],
  ["wait", "loop"]
];

test.describe("session 1 algorithm routing", () => {
  for (const viewport of viewports) {
    test(`keeps connectors visible at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/previews/seance-1-fusion.html");

      const card = page.locator(".algorithm-premium-card[data-session='1']");
      const svg = card.locator("svg.algorithm-premium-svg[data-routing-audit='ok']");

      await expect(svg).toBeVisible();
      await expect(svg.locator(".algorithm-layout-connectors path.algorithm-connector")).toHaveCount(7);

      const geometry = await svg.evaluate((svgElement, expectedMainEdges) => {
        const number = value => Number.parseFloat(value || "0") || 0;

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
            return { left: x, right: x + width, top: y, bottom: y + height };
          }

          const points = (shape.getAttribute("points") || "")
            .trim()
            .split(/\s+/)
            .map(pair => {
              const [x, y] = pair.split(",").map(number);
              return { x: x + dx, y: y + dy };
            });
          return {
            left: Math.min(...points.map(point => point.x)),
            right: Math.max(...points.map(point => point.x)),
            top: Math.min(...points.map(point => point.y)),
            bottom: Math.max(...points.map(point => point.y))
          };
        };

        const segmentCrossesBox = (first, second, box) => {
          if (first.x === second.x) {
            const low = Math.min(first.y, second.y);
            const high = Math.max(first.y, second.y);
            return first.x > box.left && first.x < box.right
              && Math.max(low, box.top) < Math.min(high, box.bottom);
          }

          if (first.y === second.y) {
            const low = Math.min(first.x, second.x);
            const high = Math.max(first.x, second.x);
            return first.y > box.top && first.y < box.bottom
              && Math.max(low, box.left) < Math.min(high, box.right);
          }

          return false;
        };

        const nodeBoxes = new Map([...svgElement.querySelectorAll(".algorithm-node")]
          .map(node => [node.dataset.node, shapeBox(node)]));

        const main = expectedMainEdges.map(([source, target]) => {
          const path = svgElement.querySelector(`path.algorithm-connector[data-source="${source}"][data-target="${target}"]`);
          const box = path.getBBox();
          const points = parsePoints(path.getAttribute("d") || "");
          const first = points[0];
          const last = points[points.length - 1];
          const verticalSteps = points.slice(1)
            .map((point, index) => point.y - points[index].y)
            .filter(step => step !== 0);
          const targetBox = nodeBoxes.get(target);

          return {
            source,
            target,
            d: path.getAttribute("d"),
            length: path.getTotalLength(),
            height: box.height,
            markerEnd: path.getAttribute("marker-end"),
            stroke: path.getAttribute("stroke"),
            firstY: first.y,
            lastY: last.y,
            folded: first.y >= last.y || verticalSteps.some(step => step < 0),
            targetGap: targetBox.top - last.y
          };
        });

        const loopPath = svgElement.querySelector('path.algorithm-connector[data-source="loop"][data-target="read"]');
        const loopBox = loopPath.getBBox();
        const loopPoints = parsePoints(loopPath.getAttribute("d") || "");
        const loopCollisions = [];
        for (const [node, box] of nodeBoxes.entries()) {
          if (node === "loop" || node === "read") continue;
          for (let index = 0; index < loopPoints.length - 1; index += 1) {
            if (segmentCrossesBox(loopPoints[index], loopPoints[index + 1], box)) {
              loopCollisions.push(node);
              break;
            }
          }
        }

        const labels = [...svgElement.querySelectorAll(".algorithm-branch-label")].map(label => {
          const box = label.getBoundingClientRect();
          return {
            text: label.textContent.trim(),
            left: box.left,
            right: box.right,
            top: box.top,
            bottom: box.bottom
          };
        });
        const renderedNodeBoxes = [...svgElement.querySelectorAll(".algorithm-node .algorithm-node-shape")].map(shape => {
          const box = shape.getBoundingClientRect();
          return {
            node: shape.closest(".algorithm-node").dataset.node,
            left: box.left,
            right: box.right,
            top: box.top,
            bottom: box.bottom
          };
        });

        const labelOverlaps = [];
        for (const label of labels) {
          for (const node of renderedNodeBoxes) {
            if (Math.max(label.left, node.left) < Math.min(label.right, node.right)
              && Math.max(label.top, node.top) < Math.min(label.bottom, node.bottom)) {
              labelOverlaps.push(`${label.text}->${node.node}`);
            }
          }
        }

        return {
          main,
          loop: {
            d: loopPath.getAttribute("d"),
            length: loopPath.getTotalLength(),
            width: loopBox.width,
            height: loopBox.height,
            collisions: loopCollisions
          },
          labelOverlaps
        };
      }, mainEdges);

      for (const path of geometry.main) {
        expect(path.length, `${path.source}->${path.target} length`).toBeGreaterThan(18);
        expect(path.height, `${path.source}->${path.target} height`).toBeGreaterThan(15);
        expect(path.folded, `${path.source}->${path.target} should not fold`).toBe(false);
        expect(Math.abs(path.targetGap), `${path.source}->${path.target} target top port`).toBeLessThanOrEqual(0.5);
        expect(path.markerEnd, `${path.source}->${path.target} marker`).toContain("algorithmArrow");
        expect(path.stroke, `${path.source}->${path.target} stroke`).toBe("#67e8f9");
      }

      expect(geometry.loop.length, "loop->read length").toBeGreaterThan(450);
      expect(geometry.loop.height, "loop->read height").toBeGreaterThan(400);
      expect(geometry.loop.width, "loop->read width").toBeGreaterThan(20);
      expect(geometry.loop.collisions, "loop->read block crossings").toEqual([]);
      expect(geometry.labelOverlaps).toEqual([]);

      await card.scrollIntoViewIfNeeded();
      await card.locator(".algorithm-premium-stage").evaluate(stage => {
        const svg = stage.querySelector("svg.algorithm-premium-svg");
        const visibleParts = [...svg.querySelectorAll(".algorithm-node .algorithm-node-shape, .algorithm-layout-connectors path")];
        const bounds = visibleParts.reduce((accumulator, element) => {
          const box = element.getBoundingClientRect();
          return {
            left: Math.min(accumulator.left, box.left),
            right: Math.max(accumulator.right, box.right)
          };
        }, { left: Number.POSITIVE_INFINITY, right: Number.NEGATIVE_INFINITY });
        const stageBox = stage.getBoundingClientRect();
        const graphCenter = (bounds.left + bounds.right) / 2;
        const stageCenter = stageBox.left + stageBox.width / 2;

        stage.scrollLeft += graphCenter - stageCenter;
      });
      await page.screenshot({
        path: `test-results/session-one-routing-${viewport.width}x${viewport.height}.png`
      });
    });
  }
});
