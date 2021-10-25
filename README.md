# Roll20 Fancy Dice

**Please note: Due to how often it broke when Roll20 released an update, and the fact that I no longer use Roll20, I have decided no longer to maintain the project. The wonderful [Foundry VTT](https://foundryvtt.com/) have a similiar (but much better!) plugin called [Dice So Nice!](https://foundryvtt.com/packages/dice-so-nice).**

This extension allows you to choose from a selection of "skins" for you Roll20 3D dice. Whenever you or someone else with the extension installed rolls the dice, you will see these custom dice instead of the default ones. Some of the dice support the use of a custom color, either your color in the Roll20 campaign or an override color assigned in the extension. You can also assign the skin and color for each polyhedral dice type if you wish. By default you settings are specific to each Roll20 campaign, but you can also choose to use your settings globally.

Please feel free to contribute, more dice are especially needed. The dice are just some image textures (take a look in [this folder](https://github.com/tobloef/roll20-fancy-dice/tree/master/assets/custom-dice)), so you don't necessarily need any coding experience to add new ones. [Open an issue](https://github.com/tobloef/roll20-fancy-dice/issues/new) if you need help.

The extension works by intercepting requests from Roll20 and injecting code to load the custom textures. The injection method itself is based on how [VTT Enhancement Suite](https://github.com/justas-d/roll20-enhancement-suite) does it. 

**If you want to contribute to the project by adding your own dice, please check out [this guide on how to do just that](https://github.com/tobloef/roll20-fancy-dice/wiki/How-to-add-your-own-dice-to-the-extension).**

![Screenshot of the extension](https://github.com/tobloef/roll20-fancy-dice/blob/master/screenshot.png)
