import { world, system, MolangVariableMap } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

// 1. ENTREGA DO MANUAL AO ENTRAR NO MUNDO
world.afterEvents.playerSpawn.subscribe((event) => {
  const player = event.player;
  const initialSpawn = event.initialSpawn;

  // Executa apenas no primeiro entrada do jogador no mundo
  if (initialSpawn) {
    const jaRecebeu = player.getDynamicProperty("recebeu_manual_megalofobia");

    if (!jaRecebeu) {
      // Adiciona o livro customizado ao inventário
      system.run(() => {
        player.runCommandAsync("give @s megalofobia:guia_sobrevivencia 1");
        player.sendMessage("§c[ALERTA] §7Um manual de sobrevivência foi adicionado ao seu inventário. LEIA COM ATENÇÃO!");
      });
      
      // Marca que este jogador já recebeu o item
      player.setDynamicProperty("recebeu_manual_megalofobia", true);
    }
  }
});

// 2. SISTEMA DE LEITURA DO LIVRO (AO USAR O ITEM)
world.afterEvents.itemUse.subscribe((event) => {
  const { source: player, itemStack } = event;

  if (itemStack.typeId === "megalofobia:guia_sobrevivencia") {
    abrirManualSobrevivencia(player);
  }
});

function abrirManualSobrevivencia(player) {
  const form = new ActionFormData();
  form.title("§4DIRETRIZES DE SOBREVIVÊNCIA");
  form.body(
    "§c=== REGRA #1: NÃO CHAME ATENÇÃO ===\n\n" +
    "§71. §wAs criaturas gigantes (como o Godzilla Bloodbath) possuem visão de longa distância. Se você correr em campo aberto, será detectado a mais de 100 blocos.\n\n" +
    "§72. §wFique agachado (sneak) ao se aproximar de sombras ou estruturas colossalmente grandes.\n\n" +
    "§73. §wEvite fazer barulho de mineração ou explosões. O som atrai as entidades diretamente para a sua posição.\n\n" +
    "§74. §wSe o céu escurecer e a terra começar a tremer, §cOCULTE-SE IMEDIATAMENTE§7. Não olhe diretamente nos olhos das entidades gigantes."
  );
  form.button("Entendido / Fechar");

  form.show(player);
}

// 3. SISTEMA DE PROXIMIDADE E EFEITOS DE MEGALOFOBIA
system.runInterval(() => {
  const overworld = world.getDimension("overworld");
  const gzList = overworld.getEntities({ type: "megalofobia:godzilla_bloodbath" });

  if (gzList.length === 0) return;

  for (const godzilla of gzList) {
    const gzPos = godzilla.location;
    const players = overworld.getPlayers();

    for (const player of players) {
      const pPos = player.location;
      
      const dx = gzPos.x - pPos.x;
      const dy = gzPos.y - pPos.y;
      const dz = gzPos.z - pPos.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance < 90) {
        if (distance < 30) {
          player.addEffect("slowness", 40, { amplifier: 2, showParticles: false });
          player.addEffect("weakness", 40, { amplifier: 1, showParticles: false });
          player.addEffect("darkness", 60, { amplifier: 0, showParticles: true });
        } else if (distance < 60) {
          player.addEffect("slowness", 40, { amplifier: 0, showParticles: false });
          player.addEffect("darkness", 40, { amplifier: 0, showParticles: false });
        }

        const particleMap = new MolangVariableMap();
        overworld.spawnParticle("minecraft:large_explosion", gzPos, particleMap);
      }
    }
  }
}, 10);
