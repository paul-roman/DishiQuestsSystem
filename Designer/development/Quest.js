/**
 * Created by roman_p on 05/07/16.
 */

function Quest()
{
	this.initialize.apply(this, arguments);
}

Quest.prototype.initialize = function(id)
{
	this.id = id;
	this.type = -1;
	this.name = "Name";
	this.giver = "";
	this.location = "";
	this.desc = "";
	this.icon = -1;
	this.steps = [["", true]];
	this.rewards = [["none", 0, 0]];
};