const reg = new RegExp("(" + /[-:@a-zA-Z0-9_.,~%+\/\\?=&#!;()[\]$]/.source + "|" + /[\u0030-\u0039\u0041-\u005A\u0061-\u007A\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u0100-\u1FFF\u3040-\u9FFF\uF900-\uFDFF\uFE70-\uFEFE\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFDC]/.source + ")");
const protocol = /\b(?:(?:https?|s?ftp|ftps|file|nfs):\/\/|mailto:|tel:|www\.)/;
const protocolReg = new RegExp(protocol.source + reg.source + "+","gi");


export const isLink = function(url = '') {
    return url.match(protocolReg)
}
