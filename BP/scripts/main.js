import { world, system, MolangVariableMap } from "@minecraft/server";

// Sistema de Efeitos de Megalofobia quando o Godzilla se aproxima
system.runInterval(() => {
  const overworld = world.getDimension("overworld");
  const gzList = overworld.getEntities({ type: "megalofobia:godzilla_bloodbath" });

  if (gzList.length === 0) return;

  for (const godzilla of gzList) {
    const gzPos = godzilla.location;
    const players = overworld.getPlayers();

    for (const player of players) {
      const pPos = player.location;
      
      // Cálculo de distância 3D
      const dx = gzPos.x - pPos.x;
      const dy = gzPos.y - pPos.y;
      const dz = gzPos.z - pPos.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Raio de megalofobia (90 blocos)
      if (distance < 90) {
        // Efeito de tremer/fraqueza proporcional à proximidade
        if (distance < 30) {
          player.addEffect("slowness", 40, { amplifier: 2, showParticles: false });
          player.addEffect("weakness", 40, { amplifier: 1, showParticles: false });
          player.addEffect("darkness", 60, { amplifier: 0, showParticles: true });
        } else if (distance < 60) {
          player.addEffect("slowness", 40, { amplifier: 0, showParticles: false });
          player.addEffect("darkness", 40, { amplifier: 0, showParticles: false });
        }

        // Partículas de poeira/destruição sob os pés do monstro
        const particleMap = new MolangVariableMap();
        overworld.spawnParticle("minecraft:large_explosion", gzPos, particleMap);
      }
    }
  }
}, 10);

// Log de inicialização do Script
world.afterEvents.worldInitialize.subscribe(() => {
  console.warn("[Megalofobia Add-on] Godzilla Bloodbath inicializado com sucesso!");
});
