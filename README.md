<img src="src/public/anitopia_logo.png" alt="Anitopia" width="480"/>
<img src="src/public/anitopia_demo.png" alt="Anitopia Demo" width="250" align="right"/>

Anitopia is a text-based anime RPG Discord bot, as the name suggests. It operates on a turn-based RPG system with a variety of character classes. You collect your own characters, create teams of characters, and go on adventures or challenge other players to battles. Each character has their own unique abilities and personality, just like in the anime they're based on. It's all about strategy and having fun in this turn-based RPG game!

I've decided to open up the Anitopia Project, even though it remains unfinished. As a solo developer, the project's complexities grew beyond what I could manage alone, and I haven't found collaborators who share my passion to collaborate with on this project. If you're interested in contributing to the project, please reach out! I have plenty of ideas that are yet to be executed, and I'd love to discuss them.

## Features
This bot uses slash commands as its instruction. The available commands include:

- `/main`: This is where all main commands of the bot are listed.
- `/summon`: This is where you summon your character. You get 1 free novice scroll summon every day.
- `/character`: To check your character collection. I've maximized the user experience features, so you will find some features that have not been implemented by other bots.
- `/profile`: To customize your in-game account profile.
- `/duel {user}`: To do a duel battle with other people.
- `/ping`: To check your connection latency.
- And much more..

**Game Mechanics**
<br>
<img src="https://github.com/ndy-s/anitopia-discord-bot/assets/94002483/3c81f877-8098-4421-8514-99b19107e95d" alt="Game Mechanics" height="250"/>
<br>
<b>TODO</b>: more commands and features will be added in the future.

## Demo
Watch the bot demo below:<br>
![anitopia-demo-vid](https://github.com/ndy-s/anitopia-discord-bot/assets/94002483/acab4638-0d51-4c7a-9684-174fcf5b53f0)

## Installation
I won't give a detailed instruction on how to replicate or use the project running your machine locally since it's a bit complex to set up. But, I will say to make sure you have redis-server installed and running on your system, a MongoDB server URI, your own discord server, and a discord bot application that you can create in Discord Developer Portal. To proceed, copy the `config-example.json` and `.env-example` files and adjust them with your own credentials.

## License
MIT
