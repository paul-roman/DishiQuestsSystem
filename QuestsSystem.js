/*---------------------------------------------------------------------------------------------
** Dishi Quests System
** By Dishi
** QuestsSystem.js
** Version 1.0
** Free for commercial and non commercial use
**-------------------------------------------------------------------------------------------*/
/*:
* @plugindesc v1.0 - A quests manager simple to use which allows you many customisation
* @author Dishi
*
*
* @param Quests File
* @desc The name of the file where your quests are store. Must be in the "data" folder and must be a JSON file.
* @default Quests
*
* @param Auto Rewards
* @desc "true" if you want rewards to be given after the quest success. "false" if you prefer to give them manually.
* @default true
*
* @param Quest Icon
* @desc "true" if you want to specify an icon for each quest. "false" if you prefer to use icons depending on quest type and status.
* @default false
*
* @param Module Name
* @desc The keyword you want to use for the module commands
* @default Quests_System
*
* @param ------------------
* @desc
* @default
*
* @param                
* @desc
* @default
*
* @param Menu Label
* @desc The label you want to display on the menu for the quests scene
* @default Quêtes
*
* @param Label
* @desc The label you want to display on the top of the scene
* @default Journal de quêtes
*
* @param Description Label
* @desc Label used for quest description
* @default Description
*
* @param Objectives Label
* @desc Label used for quest objectives
* @default Objectifs
*
* @param Rewards Label
* @desc Label used for quest rewards
* @default Récompenses
*
* @param XP Label
* @desc Label used for experience in quest rewards
* @default EXP
*
* @param ------------------
* @desc
* @default
*
* @param                
* @desc
* @default
*
* @param Main Quests Category Icon
* @desc ID in the iconset for main quests category
* @default 189
*
* @param Main Quest Icon
* @desc ID in the iconset for a main quest
* @default 162
*
* @param Main Succeeded Quest Icon
* @desc ID in the iconset for a main quest succeeded
* @default 165
*
* @param Main Failed Quest Icon
* @desc ID in the iconset for a main quest failed
* @default 161
*
* @param Secondary Quests Category Icon
* @desc ID in the iconset for secondary quests category
* @default 193
*
* @param Secondary Quest Icon
* @desc ID in the iconset for a secondary quest
* @default 166
*
* @param Secondary Succeeded Quest Icon
* @desc ID in the iconset for a secondary quest succeeded
* @default 164
*
* @param Secondary Failed Quest Icon
* @desc ID in the iconset for a secondary quest failed
* @default 160
*
* @param Succeeded Quests Category Icon
* @desc ID in the iconset for succeeded quests category
* @default 191
*
* @param Failed Quests Category Icon
* @desc ID in the iconset for the failed quests category
* @default 1
*
*
* @param Giver Icon
* @desc ID in the iconset for the quest giver
* @default 82
*
* @param Location Icon
* @desc ID in the iconset for the quest location
* @default 190
*
* @param Gold Icon
* @desc ID in the iconset for the quest gold reward
* @default 208
*
* @param XP Icon
* @desc ID in the iconset for the quest experience reward
* @default 72
*
*
* @help
* This is a simple system which allows you to create and manage quests for your RPG.
* Quests are of two types : main and secondary, they can be succeeded or failed.
* The plugin allows you to reveal quests, handle steps progress, rewards giving in a friendly menu.
* It is inspired a lot by modern algebra's VXA script and a bit of Breadlord's VX script.
* 
*
* Quests need to be store in a JSON file located in your "data" folder. The name of the file is chosen
* in the plugin parameters. 
* Here's the syntax :
* [
*   {
*     "id":0, // First quest's id needs to be 0, second quest's id needs to be 1, etc...
*     "type":0, // 0 for main quest, 1 for secondary quest
*     "name":"Basic tutorial",
*     "giver":"Boris",
*     "location":"The Haunted Woods",
*     "desc":"A local woman was abducted by bandits on the night of her wedding.",
*     "icon":6,
*     "steps":[ // true if you want the step to be visible, false if you prefer it to be revealed at succeed
*       ["Search for Ladia", true], 
*       ["Defeat the Orc", false],
*       ["Get back Ladia to Boris", true]
*     ],
*     "rewards":[ // second parameter is the amount and third is id in case of item, weapon or armor
*       ["item",3,1],
*       ["weapon",1,1],
*       ["armor",1,1],
*       ["gold",300,0],
*       ["xp",100,0] 
*     ]
*   },
*   [...]
* ]
*
* The plugin provides a bunch of Plugin Commands to simplify your tasks :
*
* Quests_System Menu
*    Open the quests menu.
*
* Quests_System Add ID
*    Reveal the quest.
*
* Quests_System Remove ID
*   Remove the quest from the list.
*
* Quests_System Succeed ID
*   Succeed the quest. If Auto Rewards is set on true, quest rewards will be given.
*
* Quests_System Fail ID
*   Fail the quest.
*
* Quests_System Reset ID
*   Reset the quest's steps.
*
* Quests_System NextStep ID
*   Progresses quest to next step. If there's only one step left, it will automatically succeed the quest.
*
* Quests_System LastStep ID
*   Progresses quest to one step back. If the quest is already at the first step, it will do nothing.
*
* 
* Here's now a bunch of script calls you can use in a condition :
*
* $gameQuests.getQuest(id).isMain()
*   True if the quest is a main quest.
*
* $gameQuests.getQuest(id).isSecondary()
*   True if the quest is a secondary quest.
*
* $gameQuests.getQuest(id).isSucceeded()
*   True if the quest is succeeded.
*
* $gameQuests.getQuest(id).isFailed()
*   True if the quest is failed.
*
* $gameQuests.getQuest(id).isInProgress()
*   True if the quest is in progress.
*
* $gameQuests.getQuest(id).getCurStep() == n
*   True if the quest's current step is number n (first step is 0).
*
*
* You can configure parameters as you please to feet your game.
* If you have any suggestion or bug report of any kind, send me a private message
* on my profite : http://www.rpgmakervx-fr.com/u11395
*
* Credits go to Dishi and modern algebra for interface inspiration.
*/

/*---------------------------------------------------------------------------------------------
** Initialization
**-------------------------------------------------------------------------------------------*/
var QuestsSystem = QuestsSystem || {};
QuestsSystem["version"] = 1.0;
QuestsSystem["name"] = "QuestsSystem";
QuestsSystem["params"] = PluginManager.parameters("QuestsSystem");

var $dataQuests = null;
var $gameQuests = null;

var curCategory = "";
var curCategoryQuests = [];
var isMoved;

DataManager._databaseFiles.push({name: "$dataQuests", src: (QuestsSystem["params"]["Quests File"] + ".json")});

/*---------------------------------------------------------------------------------------------
** Aliases
**-------------------------------------------------------------------------------------------*/
questsSystemPartyInit = Game_Party.prototype.initialize;
questsSystemModule = Game_Interpreter.prototype.pluginCommand;
questsSystemDataInit = DataManager.createGameObjects;
questsSystemDataSave = DataManager.makeSaveContents;
questsSystemDataLoad = DataManager.extractSaveContents;
questsSystemMenu = Scene_Menu.prototype.createCommandWindow;

/*---------------------------------------------------------------------------------------------
** Module Encapsulation
**-------------------------------------------------------------------------------------------*/
Game_Interpreter.prototype.pluginCommand = function(command, av)
{
	questsSystemModule.call(this, command, av);
	if (command.toLowerCase() == QuestsSystem["params"]["Module Name"].toLowerCase())
	{
		switch (av[0].toLowerCase())
		{
			case "add":
			$gameParty.addQuest(Number(av[1]));
			break;

			case "remove":
			$gameParty.removeQuest(Number(av[1]));
			break;

			case "succeed":
			$gameQuests.getQuest(Number(av[1])).succeed();
			break;

			case "fail":
			$gameQuests.getQuest(Number(av[1])).fail();
			break;

			case "reset":
			$gameQuests.getQuest(Number(av[1])).reset();
			break;

			case "nextstep":
			$gameQuests.getQuest(Number(av[1])).nextStep();
			break;

			case "laststep":
			$gameQuests.getQuest(Number(av[1])).lastStep();
			break;

			case "menu":
			SceneManager.push(Scene_Quests);
			break;
		}
	}
};

/*---------------------------------------------------------------------------------------------
** DataManager
**-------------------------------------------------------------------------------------------*/  
DataManager.createGameObjects = function()
{
	questsSystemDataInit.call(this);
	$gameQuests = new Game_Quests();
};

DataManager.makeSaveContents = function()
{
	questsContent = questsSystemDataSave.call(this);
	questsContent.quests = $gameQuests;
	return (questsContent);
};

DataManager.extractSaveContents = function(questsContent)
{
	questsSystemDataLoad.call(this, questsContent);
	$gameQuests = questsContent.quests;
};

/*---------------------------------------------------------------------------------------------
** Window_Base
**-------------------------------------------------------------------------------------------*/
Window_Base.prototype.drawBar = function(x, y, width)
{
	this.contents.fillRect(x, y, width, 2, this.systemColor());
	this.contents.fillRect(x, y + 2, width, 1, this.gaugeBackColor());
}

Window_Base.prototype.drawVertBar = function(x, y, height)
{
	this.contents.fillRect(x, y, 2, height, this.systemColor());
	this.contents.fillRect(x, y + height, 2, 1, this.gaugeBackColor());
}

Window_Base.prototype.sliceText = function(text, width)
{
	var words = text.split(" ");
	if (words.length === 1)
		return (words);
	var result = [];
	var current_text = words.shift();
	for (var i = 0; i < words.length; i += 1)
	{
		var word = words[i];
		var textW = this.contents.measureTextWidth(current_text + " " + word);
		if (textW > width)
		{
			result.push(current_text);
			current_text = word;
		}
		else
			current_text += " " + word;
		if (i >= words.length - 1)
			result.push(current_text) 
	}
	return (result)
}

/*---------------------------------------------------------------------------------------------
** Game_Party
**-------------------------------------------------------------------------------------------*/
Game_Party.prototype.initialize = function()
{
	questsSystemPartyInit.call(this);
	this.quests = [];
};

Game_Party.prototype.addQuest = function(questId)
{
	if (this.quests.indexOf(questId) < 0)
		this.quests.push(questId);
	$gameQuests.getQuest(questId);
};

Game_Party.prototype.removeQuest = function(questId)
{
	if (this.quests.indexOf(questId) > -1)
		this.quests.splice(this.quests.indexOf(questId), 1);
};

Game_Party.prototype.getQuests = function()
{
	return (this.quests);
};

Game_Party.prototype.hasQuest = function(questId)
{
	return (this.quests.indexOf(questId) > -1);
};

Game_Party.prototype.totalQuests = function(filter)
{
	if (filter === "all")
		return (this.quests);

	var count = [];
	for (var i = 0; i < this.quests.length; i++)
	{
		var q = $gameQuests.quests[i];
		switch (curCategory)
		{
			case "main":
			if (q.type == 0 && q.status == "progress")
				count.push(q);
			break;

			case "secondary":
			if (q.type == 1 && q.status == "progress")
				count.push(q);
			break;

			case "succeeded":
			if (q.status == "succeeded")
				count.push(q);
			break;

			case "failed":
			if (q.status == "failed")
				count.push(q);
			break;
		}
	}
	return (count);
};

/*---------------------------------------------------------------------------------------------
** Game_Quest
**-------------------------------------------------------------------------------------------*/
function Game_Quest()
{
	this.initialize.apply(this, arguments);
}

Game_Quest.prototype.initialize = function(questId)
{
	var data = $dataQuests[questId];

	this.id = questId;
	this.type = data.type;
	this.name = data.name;
	this.giver = data.giver;
	this.location = data.location;
	this.desc = data.desc;
	this.icon = data.icon;
	this.steps = data.steps;
	this.stepsLength = this.steps.length;
	this.rewards = data.rewards;
	this.curStep = 0;
	this.status = "progress";
}

Game_Quest.prototype.isMain = function()
{
	return (this.type == 0);
}

Game_Quest.prototype.isSecondary = function()
{
	return (this.type == 1);
}

Game_Quest.prototype.isSucceeded = function()
{
	return (this.status == "succeeded");
}

Game_Quest.prototype.isFailed = function()
{
	return (this.status == "failed");
}

Game_Quest.prototype.isInProgress = function()
{
	return (this.status == "progress");
}

Game_Quest.prototype.getCurStep = function()
{
	return (this.curStep);
}

Game_Quest.prototype.nextStep = function()
{
	if (this.status != "progress")
		return;

	if (this.curStep + 1 > this.stepsLength - 1)
		this.succeed();
	else
		this.curStep++;
}

Game_Quest.prototype.lastStep = function()
{
	if (this.status != "progress")
		return;

	if (this.curStep - 1 < 0)
		this.curStep = 0;
	else
		this.curStep--;
}

Game_Quest.prototype.giveRewards = function()
{
	console.log("rewards given");
	for (var i = 0; i < this.rewards.length; i++)
	{
		var r = this.rewards[i];
		switch (r[0])
		{
			case "item":
			$gameParty.gainItem($dataItems[r[2]], Number(r[1]));
			break;

			case "weapon":
			$gameParty.gainItem($dataWeapons[r[2]], Number(r[1]));
			break;

			case "armor":
			$gameParty.gainItem($dataArmors[r[2]], Number(r[1]));
			break;

			case "gold":
			$gameParty.gainGold(Number(r[1]));
			break;

			case "xp":
			for (var j = 0; j < $gameParty.members().length; j++)
				$gameParty.members()[j].gainExp(Number(r[1]));
			break;
		}
	}
}

Game_Quest.prototype.succeed = function()
{
	if ((QuestsSystem["params"]["Auto Rewards"] || "false").toLowerCase() == "true")
		this.giveRewards();
	this.curStep = this.stepsLength - 1;
	this.status = "succeeded";
}

Game_Quest.prototype.fail = function()
{
	this.status = "failed";
}

Game_Quest.prototype.reset = function()
{
	this.curStep = 0;
	this.status = "progress";
}

/*---------------------------------------------------------------------------------------------
** Game_Quests
**-------------------------------------------------------------------------------------------*/
function Game_Quests()
{
	this.initialize.apply(this, arguments);
}

Game_Quests.prototype.initialize = function()
{
	this.quests = [];
}

Game_Quests.prototype.getQuest = function(questId)
{
	if (!$dataQuests[questId])
		return (null);
	if (!this.quests[questId])
		this.quests[questId] = new Game_Quest(questId);
	return (this.quests[questId]);
}

/*---------------------------------------------------------------------------------------------
** Window_QuestsCategories
**-------------------------------------------------------------------------------------------*/
function Window_QuestsCategories()
{
	this.initialize.apply(this, arguments);	
};

Window_QuestsCategories.prototype = Object.create(Window_Selectable.prototype);
Window_QuestsCategories.prototype.constructor = Window_QuestsCategories;

Window_QuestsCategories.prototype.initialize = function()
{
	var width = 250;
	var height = 125;
	Window_Selectable.prototype.initialize.call(this, 0, 0, width, height);
	this.refresh();
};

Window_QuestsCategories.prototype.maxCols = function()
{
	return (4);
};

Window_QuestsCategories.prototype.maxItems = function()
{
	return (4);
};

Window_QuestsCategories.prototype.itemHeight = function()
{
	return (Window_Base._iconHeight + 4);
};

Window_QuestsCategories.prototype.itemWidth = function()
{
	return (Window_Base._iconWidth + 4);
};

Window_QuestsCategories.prototype.itemRect = function(index)
{
	var maxCols = 4;
	var rect = new Rectangle();
	rect.width = this.itemWidth();
	rect.height = this.itemHeight();
	var quarter = this.contentsWidth() / 4; 
	rect.x = (quarter * index) - Window_Base._iconWidth / 2 + quarter / 2;
	rect.y = Math.floor(index / maxCols) * rect.height - this._scrollY;
	return (rect);
};

Window_QuestsCategories.prototype.drawItem = function(index)
{
	var rect = this.itemRect(index);
	var icon = 0;
	switch (index)
	{
		case 0:
		icon = Number(QuestsSystem["params"]["Main Quests Category Icon"]);
		break;
		case 1:
		icon = Number(QuestsSystem["params"]["Secondary Quests Category Icon"]);
		break;
		case 2:
		icon = Number(QuestsSystem["params"]["Succeeded Quests Category Icon"]);
		break;
		case 3:
		icon = Number(QuestsSystem["params"]["Failed Quests Category Icon"]);
		break;
	}
	this.drawIcon(icon, rect.x + 2, rect.y + 2);
};

Window_QuestsCategories.prototype.select = function(index)
{
	Window_Selectable.prototype.select.call(this, index);
	var label = "";
	switch (index)
	{
		case 0:
		label = "Quêtes principales"
		curCategory = "main";
		break;

		case 1:
		label = "Quêtes secondaires"
		curCategory = "secondary";
		break;

		case 2:
		label = "Quêtes réussies"
		curCategory = "succeeded";
		break;

		case 3:
		label = "Quêtes échouées"
		curCategory = "failed";
		break;
	}
	this.contents.clear();
	this.drawAllItems();
	this.drawBar(0, 45, this.contentsWidth());
	this.drawText(label, 0, 55, 215, "center");
	isMoved = true;
}

/*---------------------------------------------------------------------------------------------
** Window_QuestsList
**-------------------------------------------------------------------------------------------*/
function Window_QuestsList()
{
	this.initialize.apply(this, arguments);	
};

Window_QuestsList.prototype = Object.create(Window_Selectable.prototype);
Window_QuestsList.prototype.constructor = Window_QuestsList;

Window_QuestsList.prototype.initialize = function()
{
	var width = 250;
	var height = Graphics.height - 125;
	Window_Selectable.prototype.initialize.call(this, 0, 125, width, height);
	this.refresh();
};

Window_QuestsList.prototype.maxCols = function()
{
	return (1);
};

Window_QuestsList.prototype.maxItems = function()
{
	return ($gameParty.totalQuests().length);
};

Window_QuestsList.prototype.drawItem = function(index)
{
	var quest = curCategoryQuests[index];
	if (quest)
	{
		var rect = this.itemRectForText(index);
		var name = quest.name;
		var iconId = 0;

		if (QuestsSystem["params"]["Quest Icon"].toLowerCase() == "true")
			iconId = quest.icon;
		else if (quest.type == 0 && quest.status == "progress")
			iconId = Number(QuestsSystem["params"]["Main Quest Icon"]);
		else if (quest.type == 1 && quest.status == "progress")
			iconId = Number(QuestsSystem["params"]["Secondary Quest Icon"]);
		else if (quest.type == 0 && quest.status == "succeeded")
			iconId = Number(QuestsSystem["params"]["Main Succeeded Quest Icon"]);
		else if (quest.type == 1 && quest.status == "succeeded")
			iconId = Number(QuestsSystem["params"]["Secondary Succeeded Quest Icon"]);
		else if (quest.type == 0 && quest.status == "failed")
			iconId = Number(QuestsSystem["params"]["Main Failed Quest Icon"]);
		else if (quest.type == 1 && quest.status == "failed")
			iconId = Number(QuestsSystem["params"]["Secondary Failed Quest Icon"]);

		this.drawIcon(iconId, rect.x - 7, rect.y + 1);
		this.drawText(name, rect.x + Window_Base._iconWidth, rect.y, rect.width - 32);
	}
};

Window_QuestsList.prototype.setDescWindow = function(_window)
{
	this._descWindow = _window;
};

Window_QuestsList.prototype.update = function()
{
	Window_Selectable.prototype.update.call(this);
	this.updateDescription();
};

Window_QuestsList.prototype.updateDescription = function()
{
	if (!this._descWindow)
		return;
	this._descWindow.setQuest(curCategoryQuests[this.index()]);
};

/*---------------------------------------------------------------------------------------------
** Window_QuestsLabel
**-------------------------------------------------------------------------------------------*/
function Window_QuestsLabel()
{
	this.initialize.apply(this, arguments);	
};

Window_QuestsLabel.prototype = Object.create(Window_Base.prototype);
Window_QuestsLabel.prototype.constructor = Window_QuestsLabel;

Window_QuestsLabel.prototype.initialize = function()
{
	var width = Graphics.width - 250;
	var height = 80;
	Window_Selectable.prototype.initialize.call(this, 250, 0, width, height);
	this.refresh();
};

Window_QuestsLabel.prototype.refresh = function()
{
	this.contents.clear();
	this.changeTextColor(this.systemColor());
	this.drawText(QuestsSystem["params"]["Label"], 0, 5, Graphics.width - 215, "center");
	this.resetTextColor();
}

/*---------------------------------------------------------------------------------------------
** Window_QuestDesc
**-------------------------------------------------------------------------------------------*/
function Window_QuestDesc()
{
	this.initialize.apply(this, arguments);	
};

Window_QuestDesc.prototype = Object.create(Window_Selectable.prototype);
Window_QuestDesc.prototype.constructor = Window_QuestDesc;

Window_QuestDesc.prototype.initialize = function()
{
	var width = Graphics.width - 250;
	var height = Graphics.height - 80;
	this.offY = 0;
	this.lineY = 0;
	this.isResizable = false;
	Window_Selectable.prototype.initialize.call(this, 250, 80, width, height);
	this.descBitmap = new Bitmap(this.contentsWidth(), this.contentsHeight());
	this.refresh();
};

Window_QuestDesc.prototype.drawBar = function(x, y, width)
{
	this.descBitmap.fillRect(x, y, width, 2, this.systemColor());
	this.descBitmap.fillRect(x, y + 2, width, 1, this.gaugeBackColor());
}

Window_QuestDesc.prototype.drawVertBar = function(x, y, height)
{
	this.descBitmap.fillRect(x, y, 2, height, this.systemColor());
	this.descBitmap.fillRect(x, y + height, 2, 1, this.gaugeBackColor());
}

Window_QuestDesc.prototype.drawItemName = function(item, x, y, width)
{
	width = width || 312;
	if (item)
	{
		var iconBoxWidth = Window_Base._iconWidth + 8;
		this.descBitmap.textColor = this.normalColor();
		this.drawIcon(item.iconIndex, x - 2, y + 2);
		this.descBitmap.drawText(item.name, x + iconBoxWidth, y, width - iconBoxWidth, this.lineHeight());
	}
};

Window_QuestDesc.prototype.drawIcon = function(iconIndex, x, y)
{
	var bitmap = ImageManager.loadSystem('IconSet');
	var pw = Window_Base._iconWidth;
	var ph = Window_Base._iconHeight;
	var sx = iconIndex % 16 * pw;
	var sy = Math.floor(iconIndex / 16) * ph;
	this.descBitmap.blt(bitmap, sx, sy, pw, ph, x, y);
};

Window_QuestDesc.prototype.setQuest = function(quest)
{
	if (this.quest === quest)
		return;

	this.quest = quest;
	this.offY = 0;
	this.isResizable = false;
	this.descBitmap.resize(this.descBitmap.width, this.contentsHeight());
	this.createQuestContent();
	this.refresh();
}

Window_QuestDesc.prototype.createQuestContent = function()
{
	this.descBitmap.clear();
	if (!this.quest)
		return;

	this.lineY = 0
	this.createQuestHeader();
	this.createQuestDesc();
	this.createQuestObjectives();
	this.createQuestRewards();
	
	if (this.isResizable)
	{
		this.isResizable = false;
		this.createQuestContent();
	}
}

Window_QuestDesc.prototype.createQuestHeader = function()
{
	this.drawBar(0, this.lineY + 17, this.contentsWidth() - 245 - this.quest.name.length * 8);
	this.descBitmap.drawText(this.quest.name, 0, this.lineY, Graphics.width - 250, this.lineHeight(), "center");
	this.drawBar(this.quest.name.length * 8 + this.contentsWidth() - 250, this.lineY + 17, this.contentsWidth() - 250 - this.quest.name.length * 8);
	this.heightUpdate();

	this.drawIcon(Number(QuestsSystem["params"]["Giver Icon"]), 100, this.lineY);
	this.descBitmap.drawText(this.quest.giver, 0, this.lineY, Graphics.width - 400, this.lineHeight(), "right");
	this.heightUpdate();

	this.drawIcon(Number(QuestsSystem["params"]["Location Icon"]), 100 , this.lineY);
	this.descBitmap.drawText(this.quest.location, 0, this.lineY, Graphics.width - 400, this.lineHeight(), "right");
	this.heightUpdate(true);
}

Window_QuestDesc.prototype.createQuestDesc = function()
{
	this.descBitmap.textColor = this.systemColor();
	this.descBitmap.drawText(String(QuestsSystem["params"]["Description Label"]), 64, this.lineY, Graphics.width - 250, this.lineHeight());
	this.descBitmap.textColor = this.normalColor();
	var descLength = String(QuestsSystem["params"]["Description Label"]).length * 20;
	this.drawBar(12, this.lineY + 17, 44);
	this.drawBar(descLength + 6, this.lineY + 17, Graphics.width - 304 - descLength);
	this.heightUpdate();

	var lines = this.sliceText(this.quest.desc, this.contentsWidth() - 32);
	for (var i = 0; i < lines.length; i++)
	{
		this.descBitmap.drawText(lines[i], 32, this.lineY, this.contentsWidth() - 32, this.lineHeight());
		this.heightUpdate();
	}

	this.drawVertBar(12, this.lineY - (lines.length * this.lineHeight() + 17), lines.length * this.lineHeight() + 32);
	this.drawVertBar(this.contentsWidth() - 14, this.lineY - (lines.length * this.lineHeight() + 17), lines.length * this.lineHeight() + 32);
	this.drawBar(12, this.lineY + 14, this.contentsWidth() - 24);
	this.heightUpdate(true);
}

Window_QuestDesc.prototype.createQuestObjectives = function()
{
	this.descBitmap.textColor = this.systemColor();
	this.descBitmap.drawText(String(QuestsSystem["params"]["Objectives Label"]), 64, this.lineY, Graphics.width - 250, this.lineHeight());
	this.descBitmap.textColor = this.normalColor();
	this.heightUpdate();

	for (var i = 0; i < this.quest.stepsLength; i++)
	{
		var step = this.quest.steps[i];
		if (!step[1] && this.quest.curStep <= i)
			continue;
		var iconId = 0;

		if (this.quest.status == "succeeded")
		{
			if (this.quest.type == 0)
				iconId = Number(QuestsSystem["params"]["Main Succeeded Quest Icon"]);
			else if (this.quest.type == 1)
				iconId = Number(QuestsSystem["params"]["Secondary Succeeded Quest Icon"]);
		}
		else if (this.quest.status == "failed")
		{
			if (this.quest.type == 0)
				iconId = Number(QuestsSystem["params"]["Main Failed Quest Icon"]);
			else if (this.quest.type == 1)
				iconId = Number(QuestsSystem["params"]["Secondary Failed Quest Icon"]);
		}
		else if (this.quest.curStep > i)
		{
			if (this.quest.type == 0)
				iconId = Number(QuestsSystem["params"]["Main Succeeded Quest Icon"]);
			else if (this.quest.type == 1)
				iconId = Number(QuestsSystem["params"]["Secondary Succeeded Quest Icon"]);
		}
		else
		{
			if (this.quest.type == 0)
				iconId = Number(QuestsSystem["params"]["Main Quest Icon"]);
			else if (this.quest.type == 1)
				iconId = Number(QuestsSystem["params"]["Secondary Quest Icon"]);
		}

		this.drawIcon(iconId, 12, this.lineY);
		var lines = this.sliceText(step[0], this.contentsWidth() - 32);
		for (var j = 0; j < lines.length; j++)
		{
			this.descBitmap.drawText(lines[j], Window_Base._iconWidth + 24, this.lineY, this.contentsWidth() - 32, this.lineHeight());
			this.heightUpdate();
		}
	}
	this.heightUpdate(true);
}

Window_QuestDesc.prototype.createQuestRewards = function()
{
	var rewardsTitle = String(QuestsSystem["params"]["Rewards Label"]);
	this.descBitmap.textColor = this.systemColor();
	this.drawBar(0, this.lineY + 17, this.contentsWidth() - 245 - rewardsTitle.length * 8);
	this.descBitmap.drawText(rewardsTitle, 0, this.lineY, Graphics.width - 250, this.lineHeight(), "center");
	this.drawBar(rewardsTitle.length * 8 + this.contentsWidth() - 250, this.lineY + 17, this.contentsWidth() - 250 - this.quest.name.length * 8);
	this.descBitmap.textColor = this.normalColor();
	this.heightUpdate();

	var gold = 0;
	var xp = 0;
	for (var i = 0; i < this.quest.rewards.length; i++)
	{
		var r = this.quest.rewards[i];
		var n = r[1];

		if (r[0] != "gold" && r[0] != "xp")
			var id = r[2];

		switch (r[0])
		{
			case "item":
			this.drawItemName($dataItems[id], 64, this.lineY, this.contentsWidth());
			this.descBitmap.drawText("x" + n, 0, this.lineY, Graphics.width - 375, this.lineHeight(), "right");
			this.heightUpdate();
			break;

			case "weapon":
			this.drawItemName($dataWeapons[id], 64, this.lineY, this.contentsWidth());
			this.descBitmap.drawText("x" + n, 0, this.lineY, Graphics.width - 375, this.lineHeight(), "right");
			this.heightUpdate();
			break;

			case "armor":
			this.drawItemName($dataArmors[id], 64, this.lineY, this.contentsWidth());
			this.descBitmap.drawText("x" + n, 0, this.lineY, Graphics.width - 375, this.lineHeight(), "right");
			this.heightUpdate();
			break;

			case "gold":
			gold += n;
			break;

			case "xp":
			xp += n;
			break;
		}
	}
	if (gold > 0)
	{
		this.drawIcon(Number(QuestsSystem["params"]["Gold Icon"]), 64, this.lineY);
		this.descBitmap.drawText(TextManager.currencyUnit, 100, this.lineY, this.contentsWidth(), this.lineHeight());
		this.descBitmap.drawText(gold, 0, this.lineY, Graphics.width - 375, this.lineHeight(), "right");
		this.heightUpdate();
	}
	if (xp > 0)
	{

		this.drawIcon(Number(QuestsSystem["params"]["XP Icon"]), 64, this.lineY);
		this.descBitmap.drawText(QuestsSystem["params"]["XP Label"], 100, this.lineY, this.contentsWidth(), this.lineHeight());
		this.descBitmap.drawText(xp, 0, this.lineY, Graphics.width - 375, this.lineHeight(), "right");
		this.heightUpdate();
	}
	this.drawBar(0, this.lineY + 17, this.contentsWidth());
	this.heightUpdate();
}

Window_QuestDesc.prototype.refresh = function()
{
	this.contents.clear()
	if (!this.quest)
		return;
	this.contents.blt(this.descBitmap, 0, this.offY, this.contentsWidth(), this.contentsHeight(), 0, 0, this.contentsWidth(), this.contentsHeight());

}

Window_QuestDesc.prototype.heightUpdate = function(textPadding)
{
	this.lineY += this.lineHeight();
	if (textPadding !== undefined && textPadding === true)
		this.lineY += this.textPadding();
	if (this.lineY > this.descBitmap.height)
	{
		this.descBitmap.resize(this.descBitmap.width, this.lineY);
		this.isResizable = true;
	}
}

Window_QuestDesc.prototype.updateArrows = function()
{
	this.downArrowVisible = (this.descBitmap.height > this.contentsHeight() && this.offY < this.descBitmap.height - this.contentsHeight());
	this.upArrowVisible = this.offY > 0;
};

Window_QuestDesc.prototype.isCursorMovable = function()
{
	return (this.isOpenAndActive());
};

Window_QuestDesc.prototype.cursorDown = function(wrap)
{
	if (this.descBitmap.height > this.contentsHeight() && this.offY < this.descBitmap.height - this.contentsHeight())
	{
		SoundManager.playCursor();
		this.offY += this.lineHeight() + this.textPadding();
		if (this.offY > this.lineY - this.contentsHeight())
			this.offY = this.lineY - this.contentsHeight();
		this.refresh();
	}
};

Window_QuestDesc.prototype.cursorUp = function(wrap)
{
	if (this.offY > 0)
	{
		SoundManager.playCursor();
		this.offY -= this.lineHeight() + this.textPadding();
		if (this.offY < 0)
			this.offY = 0;
		this.refresh();
	}
};

Window_QuestDesc.prototype.cursorRight = function(wrap)
{
};

Window_QuestDesc.prototype.cursorLeft = function(wrap)
{
};

/*---------------------------------------------------------------------------------------------
** Scene_Quests
**-------------------------------------------------------------------------------------------*/
function Scene_Quests()
{
	this.initialize.apply(this, arguments);
}

Scene_Quests.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Quests.prototype.constructor = Scene_Quests;

Scene_Quests.prototype.initialize = function()
{
	Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Quests.prototype.create = function()
{
	Scene_MenuBase.prototype.create.call(this);
	this._questsCategoriesWindow = new Window_QuestsCategories();
	this._questsCategoriesWindow.setHandler('ok', this.onCategoryOk.bind(this));
	this._questsCategoriesWindow.setHandler('cancel', this.popScene.bind(this));
	this.addWindow(this._questsCategoriesWindow);
	this._questsCategoriesWindow.activate();
	this._questsCategoriesWindow.select(0);

	this._questsListWindow = new Window_QuestsList();
	this._questsListWindow.setHandler('ok', this.onListOk.bind(this));
	this._questsListWindow.setHandler('cancel', this.onListCancel.bind(this));
	this.addWindow(this._questsListWindow);

	this._questslabelWindow = new Window_QuestsLabel();
	this.addWindow(this._questslabelWindow);

	this._questDescWindow = new Window_QuestDesc();
	this._questDescWindow.setHandler('cancel', this.onDescCancel.bind(this));
	this.addWindow(this._questDescWindow);
	this._questsListWindow.setDescWindow(this._questDescWindow);
};

Scene_Quests.prototype.onCategoryOk = function()
{
	this._questsListWindow.activate();
	this._questsListWindow.select(0);
}

Scene_Quests.prototype.onListOk = function()
{
	this._questDescWindow.activate();
}

Scene_Quests.prototype.onListCancel = function()
{
	this._questsListWindow.deselect();
	this._questsCategoriesWindow.activate();
};

Scene_Quests.prototype.onDescCancel = function()
{
	this._questDescWindow.deselect();
	this._questsListWindow.activate();
};

Scene_Quests.prototype.start = function()
{
	Scene_MenuBase.prototype.start.call(this);
};

Scene_Quests.prototype.update = function()
{
	Scene_MenuBase.prototype.update.call(this);
	curCategoryQuests = $gameParty.totalQuests();
	if (isMoved)
	{
		this._questsListWindow.contents.clear();
		this._questsListWindow.drawAllItems();
	}
	isMoved = false;
}

/*---------------------------------------------------------------------------------------------
** Scene_Menu
**-------------------------------------------------------------------------------------------*/
Scene_Menu.prototype.commandQuestsSystem = function()
{
	SceneManager.push(Scene_Quests);
};

Scene_Menu.prototype.createCommandWindow = function()
{
	questsSystemMenu.call(this);
	this._commandWindow.setHandler(QuestsSystem["name"], this.commandQuestsSystem.bind(this));
};

/*---------------------------------------------------------------------------------------------
** Window_MenuCommand
**-------------------------------------------------------------------------------------------*/
Window_MenuCommand.prototype.addOriginalCommands = function()
{
	this.addCommand(String(QuestsSystem["params"]["Menu Label"]), QuestsSystem["name"], true);
};