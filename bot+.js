const mineflayer = require("mineflayer");
const autoeat = require('mineflayer-auto-eat').plugin
const toolPlugin = require('mineflayer-tool').plugin
const bot = mineflayer.createBot({
    host: "localhost",
    port: "you port",
    version: "you version",
    username: "ExampleBot" });

bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);

const {
    StateTransition,
    BotStateMachine,
    EntityFilters,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    BehaviorGetClosestEntity,
    NestedStateMachine } = require("mineflayer-statemachine");

bot.once("spawn", () =>
{
    const targets = {};

    const getClosestPlayer = new BehaviorGetClosestEntity(bot, targets, EntityFilters().PlayersOnly);
    const followPlayer = new BehaviorFollowEntity(bot, targets);
    const lookAtPlayer = new BehaviorLookAtEntity(bot, targets);
    
    const transitions = [
    
        new StateTransition({
            parent: getClosestPlayer,
            child: followPlayer,
            shouldTransition: () => true,
        }),
    
        new StateTransition({
            parent: followPlayer,
            child: lookAtPlayer,
            shouldTransition: () => followPlayer.distanceToTarget() < 2,
        }),

        
        new StateTransition({
            parent: lookAtPlayer,
            child: followPlayer,
            shouldTransition: () => lookAtPlayer.distanceToTarget() >= 2,
        }),
    ];

    const rootLayer = new NestedStateMachine(transitions, getClosestPlayer);
    
    new BotStateMachine(bot, rootLayer);
});
bot.loadPlugin(autoeat)

bot.on('autoeat_started', (item, offhand) => {
    console.log(`Eathing ${item.name} in ${offhand ? 'offhand' : 'hand'}`)
})
bot.on('autoeat_finished', (item, offhand) => {
    console.log(`Finished eathing ${item.name} in ${offhand ? 'offhand' : 'hand'}`)
})

bot.on('autoeat_error', console.error)
bot.loadPlugin(toolPlugin)

bot.on('spawn', async () => {
    const blockPos = bot.entity.position.offset(0, -1, 0)
    const block = bot.blockAt(blockPos)

    await bot.tool.equipForBlock(block, {})
    await bot.dig(block)
})
