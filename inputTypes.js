module.exports = {
    "html" :{
        "heading": function (type, paramid, name) {
            return "<h2>" + name + "</h2>";
        },
        "radio": function (type, paramid, name, values) {
            var html = '<div class="form-group"><div id="' + paramid + '" class="btn-group" data-toggle="buttons">';
            for (var i = 0; i < name.length; i++) {
                html += '<label class="btn btn-default"> <input type="radio" name="' + paramid + '" value="' + values[i] +'">' + name[i] + '</label>';
            }
            html += '</div></div>';
            return html;
        }
    },
    "js": {
        "radio": function(paramid) {
            return "$('#" + paramid +" label.active input').val();";
        }
    }
};