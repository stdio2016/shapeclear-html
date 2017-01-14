function errorHandler(msg, source, lineno, colno, err) {
    window.onerror = null;
    document.getElementById('alert').style.visibility = 'visible';
    var des =
      'Shape Clear has encountered an error' + '\n' +
      msg + '\n';
    if (msg.match(/script error/i)) {
        des += 'see Browser Console for more information';
    }
    else {
        des +=
          'source: ' + source + '\n' +
          'position: ' + lineno + ',' + colno + '\n' +
          'stack trace: \n' + err.stack;
    }
    document.getElementById('description').innerText = des;
}

function closeErrorBox() {
    document.getElementById('alert').style.visibility = 'hidden';
    window.onerror = errorHandler;
}

// Add error handler
window.onerror = errorHandler;
document.getElementById('close').addEventListener('click', closeErrorBox);
