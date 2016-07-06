/**
 * Created by roman_p on 04/07/16.
 */

function Designer()
{
	this.initialize.apply(this, arguments);
}

Designer.prototype.initialize = function(quests)
{
	$('#before-upload').fadeOut(200);
	$('#loader').fadeIn(200);

	this.quests = jQuery.parseJSON(quests);

	$('#quest_nb').bootstrapNumber();
	$('#quest_type').val('');
	$('#loader').fadeOut(200);
	$('#after-upload').fadeIn(200);
	this.updateList();
};

Designer.prototype.padNumber = function(n)
{
	if (n <= 9999)
		n = ("000" + n).slice(-4);
	return (n);
};

Designer.prototype.changeQuestsNb = function(n)
{
	var prevNb = this.quests.length;

	if (n > prevNb)
	{
		for (var i = prevNb; i < n; i++)
			this.quests.push(new Quest(i));
		this.updateList();
	}
	else if (n < prevNb)
	{
		for (var j = prevNb; j > n; j--)
			this.quests.pop();
		this.updateList();
	}
	$('#quest_nb').attr('value', this.quests.length);
};

Designer.prototype.updateList = function()
{
	$('#quests_list').empty();
	for (var i = 0; i < this.quests.length; i++)
	{
		var line = '<a href="#" id="quest_' + i + '" class="list-group-item">' + this.padNumber(i) + ': ' + this.quests[i].name + '</a>';
		$('#quests_list').append(line);
		$('#quest_' + i).click(this.openQuest.bind(this, i));
	}
};

Designer.prototype.openQuest = function(id)
{
	console.log("Quest " + id + " opened.");
};

Designer.prototype.writeFile = function()
{
	console.log(JSON.stringify(this.quests));
};