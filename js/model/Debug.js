// 和Scratch版的D臭蟲的功能是一樣的
function Debug() {
    this.allowIllegalMove = false;
    this.disableMatching = false;
    this.showMatching = true;
}

Debug.prototype.runCommand = function (cmd) {
    if (!cmd) return;
    switch (cmd) {
      case 'allow illegal move':
        this.allowIllegalMove = true; return ;
      case 'disallow illegal move':
        this.allowIllegalMove = false; return ;
      case 'enable matching':
        this.disableMatching = false; return ;
      case 'disable matching':
        this.disableMatching = true; return ;
      case 'show matching':
        this.showMatching = true; return ;
      case 'hide matching':
        this.showMatching = false; return ;
      case 'help': case '?':
        alert("Can't help you"); return ;
      default:
        console.log('Unknown command: ' + cmd);
    }
};
