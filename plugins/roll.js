module.exports = function (config, formatResponse) {
    return {
        supports(username, avatar, message) {
            return (message.startsWith("/roll ")) || (message.startsWith("/r "))
        },
        transform(username, avatar, message) {
            let dice = message.replace("/roll ", "")
            dice = dice.replace("/r ", "")

            let r = roll(dice)
            return formatResponse(username, avatar, dice + "\n" + "**" + r + "**")
        },
    };
};

function roll(formula, rolls = 1) {
    var rr = (t, s) => {
        var v = 0;
        for (var i = 1; i <= t; i++) {
            v += 1 + Math.floor(Math.random() * s);
        }
        return v;
    };
    var f = formula
        .toLowerCase()
        .replace(/x/g, "*")
        .replace(/[^\+\-\*\/\(\)0-9\.d]/g, "")
        .replace(/([0-9]+)d([0-9]+)/g, "rr($1,$2)")
        .replace(/d([0-9]+)/g, "rr(1,$1)");
    var ansl = [];
    var ans = 0;
    for (var ti = 1; ti <= rolls; ti++) {
        try {
            eval("ans=" + f + ";");
        } catch (e) {
            return false;
        }
        ansl[ansl.length] = ans;
    }
    if (rolls < 2) {
        return ans;
    } else {
        return ansl;
    }
}