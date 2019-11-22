Missive.on('change:conversations', (ids) => {
  Missive.fetchConversations(ids, ['latest_message']).then((conversations) => {
    if (conversations.length != 1) {
      // Do nothing if multiple conversations are selected.
      return
    }

    var message = conversations[0].latest_message
    if (!message || !message.from_field) {
      // Do nothing if conversation has no message (only chat comments) or if
      // message has no From field.
      return
    }

    var from = message.from_field
    
    
    function convertTimestamp(timestamp) {
    var d = new Date(timestamp * 1000), // Convert the passed timestamp to milliseconds
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),  // Months are zero based. Add leading 0.
        dd = ('0' + d.getDate()).slice(-2),         // Add leading 0.
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),     // Add leading 0.
        ampm = 'a.m.',
        time;

    if (hh > 12) {
        h = hh - 12;
        ampm = 'p.m.';
    } else if (hh === 12) {
        h = 12;
        ampm = 'p.m.';
    } else if (hh == 0) {
        h = 12;
    }

    // ie: 2014-03-24, 3:00 PM
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
    return time;
}
    
    document.querySelector("#someText").innerHTML = convertTimestamp(message.delivered_at);

    // document.querySelector("#someText").innerHTML = "Message from: " + from.name + " &lt;" + from.address + "&gt;<br>Message subject: " + message.subject;
  })
})