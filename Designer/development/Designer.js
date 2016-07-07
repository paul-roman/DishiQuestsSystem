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

	this.curQuest = -1;
	this.curStep = -1;
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
	if (this.curQuest != -1)
		$('#quest_' + this.curQuest.id).removeClass('active');
	$('#quest_' + this.quests[id].id).addClass('active');
	$('#step_add').prop('disabled', false);
	this.curQuest = this.quests[id];

	$('#quest_name').prop('disabled', false);
	$('#quest_name').val(this.curQuest.name);

	$('#quest_desc').prop('disabled', false);
	$('#quest_desc').val(this.curQuest.desc);

	$('.bootstrap-select').removeClass('disabled');
	$('button[data-id="quest_type"]').removeClass('disabled');
	$('#quest_id').removeClass('disabled');
	$('.selectpicker').removeAttr('disabled');
	$('.selectpicker').selectpicker('val', this.curQuest.type);

	$('#quest_giver').prop('disabled', false);
	$('#quest_giver').val(this.curQuest.giver);

	$('#quest_location').prop('disabled', false);
	$('#quest_location').val(this.curQuest.location);

	this.updateStepsList();
};

Designer.prototype.updateStepsList = function()
{
	$('#quest_steps tbody > tr').remove();
	for (var i = 0; i < this.curQuest.steps.length; i++)
	{
		if (this.curQuest.steps[i][0] == "")
			break;
		var row = '<tr id="step_' + i + '" onclick="designer.editStep(' + i + ')"><td>' + this.curQuest.steps[i][0] + '</td><td>' + this.curQuest.steps[i][1] + '</td></tr>';
		$('#quest_steps > tbody:last-child').append(row);
	}
	$('#step_up').prop('disabled', true);
	$('#step_down').prop('disabled', true);
	$('#step_edit').prop('disabled', true);
	$('#step_del').prop('disabled', true);
};

Designer.prototype.editStep = function(id)
{
	$('.active_row').removeClass('active_row');
	$('#step_' + id).addClass('active_row');
	$('#step_up').prop('disabled', false);
	$('#step_down').prop('disabled', false);
	$('#step_edit').prop('disabled', false);
	$('#step_del').prop('disabled', false);
	this.curStep = this.curQuest.steps[id];
};

Designer.prototype.actionStep = function(action)
{
	if (action == "add")
	{
		$('#step_is_added').val('true');
		$('#step_name').val('');
		$('#step_visiblity').prop('checked', false);
		return;
	}

	var index = Number($('.active_row').attr('id').substring(5));
	var stepSwap;

	if (action == "up" && index > 0)
	{
		stepSwap = this.curQuest.steps[index - 1];
		this.curQuest.steps[index - 1] = this.curQuest.steps[index];
		this.curQuest.steps[index] = stepSwap;
		this.updateStepsList();
		$('#step_' + (index - 1)).addClass('active_row');
		$('#step_up').prop('disabled', false);
		$('#step_down').prop('disabled', false);
		$('#step_edit').prop('disabled', false);
		$('#step_del').prop('disabled', false);
	}

	if (action == "down" && index < this.curQuest.steps.length - 1)
	{
		stepSwap = this.curQuest.steps[index + 1];
		this.curQuest.steps[index + 1] = this.curQuest.steps[index];
		this.curQuest.steps[index] = stepSwap;
		this.updateStepsList();
		$('#step_' + (index + 1)).addClass('active_row');
		$('#step_up').prop('disabled', false);
		$('#step_down').prop('disabled', false);
		$('#step_edit').prop('disabled', false);
		$('#step_del').prop('disabled', false);
	}

	if (action == "edit")
	{
		$('#step_is_added').val('false');
		$('#step_name').val(this.curQuest.steps[index][0]);
		$('#step_visiblity').prop('checked', this.curQuest.steps[index][1]);
	}

	if (action == "del")
	{
		this.curQuest.steps.splice(index, 1);
		this.updateStepsList();
	}
};

Designer.prototype.updateStep = function()
{

	console.log($('#step_is_added').val());
	if ($('#step_is_added').val() == "true")
	{
		var step = [$('#step_name').val(), $('#step_visiblity').is(':checked')];
		this.curQuest.steps.push(step);
		this.updateStepsList();
		return;
	}
	var index = Number($('.active_row').attr('id').substring(5));
	this.curQuest.steps[index][0] = $('#step_name').val();
	this.curQuest.steps[index][1] = $('#step_visiblity').is(':checked');
	this.updateStepsList();
	$('#step_' + (index)).addClass('active_row');
	$('#step_up').prop('disabled', false);
	$('#step_down').prop('disabled', false);
	$('#step_edit').prop('disabled', false);
	$('#step_del').prop('disabled', false);
};

Designer.prototype.writeFile = function()
{
	console.log(JSON.stringify(this.quests));
};