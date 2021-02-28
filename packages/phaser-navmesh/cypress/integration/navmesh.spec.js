import Phaser from "phaser";
import NavMeshPlugin from "phaser-navmesh";

describe("NavMeshPlugin", () => {
  it("is installed properly as a scene plugin", async () => {
    const game = new Phaser.Game({
      plugins: {
        scene: [
          {
            key: "NavMeshPlugin",
            plugin: NavMeshPlugin,
            mapping: "navMeshPlugin",
            start: true,
          },
        ],
      },
    });
    const scene = {
      create() {
        expect(this.navMeshPlugin).to.be.instanceOf(NavMeshPlugin);
        return;
      },
    };
    game.scene.add("main", scene, true);
  });
});
