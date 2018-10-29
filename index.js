function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function PDRequest(token, endpoint, method, options) {

	var merged = $.extend(true, {}, {
		type: method,
		dataType: "json",
		url: "https://api.pagerduty.com/" + endpoint,
		headers: {
			"Authorization": "Token token=" + token,
			"Accept": "application/vnd.pagerduty+json;version=2"
		},
		error: function(err) {
			$('.busy').hide();
			var alertStr = "Error '" + err.status + " - " + err.statusText + "' while attempting " + method + " request to '" + endpoint + "'";
			try {
				alertStr += ": " + err.responseJSON.error.message;
			} catch (e) {
				alertStr += ".";
			}
			
			try {
				alertStr += "\n\n" + err.responseJSON.error.errors.join("\n");
			} catch (e) {}

			alert(alertStr);
		}
	},
	options);

	$.ajax(merged);
}

function main() {
	var urlsplit = document.referrer.split('/');
	var incident_id = urlsplit[urlsplit.length - 1];
	var token = getParameterByName('token');

	var options = {
		success: function(data) {
			if ( data.alerts[0].body.details.search ) {
				var search = data.alerts[0].body.details.search;
				var options = {
					url: `https://api.duckduckgo.com/?q=${search}&format=json`,
					type: 'GET',
					success: function(search_result) {
						result_obj = JSON.parse(search_result)
						if ( result_obj["Image"] ) {
							content = `<h2>here is a ${search}</h2><img src="${result_obj["Image"]}">`;
						} else {
							content = `<h2>couldn't find any ${search}</h2>`;
						}
						$("#content").html(content);
					},
					error: function(err) {
						var alertStr = "Error '" + err.status + " - " + err.statusText + "' while attempting " + method + " request to '" + endpoint + "'";
						$("#content").html(`<h2>${alertStr}</h2>`);
					}
				}
				$.ajax(options);
			} else {
				$("#content").html(`<pre>${JSON.stringify(data.alerts[0].body.details, null, '\t')}</pre>`);
			}
		}
	}
	PDRequest(token, `incidents/${incident_id}/alerts`, "GET", options)
}
$(document).ready(main);
