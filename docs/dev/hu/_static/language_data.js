/*
 * This script contains the language-specific data used by searchtools.js,
 * namely the list of stopwords, stemmer, scorer and splitter.
 */

var stopwords = ["a", "abban", "ahhoz", "ahogy", "ahol", "aki", "akik", "akkor", "alatt", "amely", "amelyek", "amelyekben", "amelyeket", "amelyet", "amelynek", "ami", "amikor", "amit", "amolyan", "am\u00edg", "annak", "arra", "arr\u00f3l", "az", "azok", "azon", "azonban", "azt", "azt\u00e1n", "azut\u00e1n", "azzal", "az\u00e9rt", "be", "bel\u00fcl", "benne", "b\u00e1r", "cikk", "cikkek", "cikkeket", "csak", "de", "e", "ebben", "eddig", "egy", "egyes", "egyetlen", "egyik", "egyre", "egy\u00e9b", "eg\u00e9sz", "ehhez", "ekkor", "el", "ellen", "els\u0151", "el\u00e9g", "el\u0151", "el\u0151sz\u00f6r", "el\u0151tt", "emilyen", "ennek", "erre", "ez", "ezek", "ezen", "ezt", "ezzel", "ez\u00e9rt", "fel", "fel\u00e9", "hanem", "hiszen", "hogy", "hogyan", "igen", "ill", "ill.", "illetve", "ilyen", "ilyenkor", "ism\u00e9t", "ison", "itt", "jobban", "j\u00f3", "j\u00f3l", "kell", "kellett", "keress\u00fcnk", "kereszt\u00fcl", "ki", "k\u00edv\u00fcl", "k\u00f6z\u00f6tt", "k\u00f6z\u00fcl", "legal\u00e1bb", "legyen", "lehet", "lehetett", "lenne", "lenni", "lesz", "lett", "maga", "mag\u00e1t", "majd", "meg", "mellett", "mely", "melyek", "mert", "mi", "mikor", "milyen", "minden", "mindenki", "mindent", "mindig", "mint", "mintha", "mit", "mivel", "mi\u00e9rt", "most", "m\u00e1r", "m\u00e1s", "m\u00e1sik", "m\u00e9g", "m\u00edg", "nagy", "nagyobb", "nagyon", "ne", "nekem", "neki", "nem", "nincs", "n\u00e9ha", "n\u00e9h\u00e1ny", "n\u00e9lk\u00fcl", "olyan", "ott", "pedig", "persze", "r\u00e1", "s", "saj\u00e1t", "sem", "semmi", "sok", "sokat", "sokkal", "szemben", "szerint", "szinte", "sz\u00e1m\u00e1ra", "tal\u00e1n", "teh\u00e1t", "teljes", "tov\u00e1bb", "tov\u00e1bb\u00e1", "t\u00f6bb", "ugyanis", "utols\u00f3", "ut\u00e1n", "ut\u00e1na", "vagy", "vagyis", "vagyok", "valaki", "valami", "valamint", "val\u00f3", "van", "vannak", "vele", "vissza", "viszont", "volna", "volt", "voltak", "voltam", "voltunk", "\u00e1ltal", "\u00e1ltal\u00e1ban", "\u00e1t", "\u00e9n", "\u00e9ppen", "\u00e9s", "\u00edgy", "\u00f6ssze", "\u00fagy", "\u00faj", "\u00fajabb", "\u00fajra", "\u0151", "\u0151k", "\u0151ket"];


/* Non-minified version is copied as a separate JS file, if available */
/**@constructor*/
BaseStemmer = function() {
    this.setCurrent = function(value) {
        this.current = value;
        this.cursor = 0;
        this.limit = this.current.length;
        this.limit_backward = 0;
        this.bra = this.cursor;
        this.ket = this.limit;
    };

    this.getCurrent = function() {
        return this.current;
    };

    this.copy_from = function(other) {
        this.current          = other.current;
        this.cursor           = other.cursor;
        this.limit            = other.limit;
        this.limit_backward   = other.limit_backward;
        this.bra              = other.bra;
        this.ket              = other.ket;
    };

    this.in_grouping = function(s, min, max) {
        if (this.cursor >= this.limit) return false;
        var ch = this.current.charCodeAt(this.cursor);
        if (ch > max || ch < min) return false;
        ch -= min;
        if ((s[ch >>> 3] & (0x1 << (ch & 0x7))) == 0) return false;
        this.cursor++;
        return true;
    };

    this.in_grouping_b = function(s, min, max) {
        if (this.cursor <= this.limit_backward) return false;
        var ch = this.current.charCodeAt(this.cursor - 1);
        if (ch > max || ch < min) return false;
        ch -= min;
        if ((s[ch >>> 3] & (0x1 << (ch & 0x7))) == 0) return false;
        this.cursor--;
        return true;
    };

    this.out_grouping = function(s, min, max) {
        if (this.cursor >= this.limit) return false;
        var ch = this.current.charCodeAt(this.cursor);
        if (ch > max || ch < min) {
            this.cursor++;
            return true;
        }
        ch -= min;
        if ((s[ch >>> 3] & (0X1 << (ch & 0x7))) == 0) {
            this.cursor++;
            return true;
        }
        return false;
    };

    this.out_grouping_b = function(s, min, max) {
        if (this.cursor <= this.limit_backward) return false;
        var ch = this.current.charCodeAt(this.cursor - 1);
        if (ch > max || ch < min) {
            this.cursor--;
            return true;
        }
        ch -= min;
        if ((s[ch >>> 3] & (0x1 << (ch & 0x7))) == 0) {
            this.cursor--;
            return true;
        }
        return false;
    };

    this.eq_s = function(s)
    {
        if (this.limit - this.cursor < s.length) return false;
        if (this.current.slice(this.cursor, this.cursor + s.length) != s)
        {
            return false;
        }
        this.cursor += s.length;
        return true;
    };

    this.eq_s_b = function(s)
    {
        if (this.cursor - this.limit_backward < s.length) return false;
        if (this.current.slice(this.cursor - s.length, this.cursor) != s)
        {
            return false;
        }
        this.cursor -= s.length;
        return true;
    };

    /** @return {number} */ this.find_among = function(v)
    {
        var i = 0;
        var j = v.length;

        var c = this.cursor;
        var l = this.limit;

        var common_i = 0;
        var common_j = 0;

        var first_key_inspected = false;

        while (true)
        {
            var k = i + ((j - i) >>> 1);
            var diff = 0;
            var common = common_i < common_j ? common_i : common_j; // smaller
            // w[0]: string, w[1]: substring_i, w[2]: result, w[3]: function (optional)
            var w = v[k];
            var i2;
            for (i2 = common; i2 < w[0].length; i2++)
            {
                if (c + common == l)
                {
                    diff = -1;
                    break;
                }
                diff = this.current.charCodeAt(c + common) - w[0].charCodeAt(i2);
                if (diff != 0) break;
                common++;
            }
            if (diff < 0)
            {
                j = k;
                common_j = common;
            }
            else
            {
                i = k;
                common_i = common;
            }
            if (j - i <= 1)
            {
                if (i > 0) break; // v->s has been inspected
                if (j == i) break; // only one item in v

                // - but now we need to go round once more to get
                // v->s inspected. This looks messy, but is actually
                // the optimal approach.

                if (first_key_inspected) break;
                first_key_inspected = true;
            }
        }
        do {
            var w = v[i];
            if (common_i >= w[0].length)
            {
                this.cursor = c + w[0].length;
                if (w.length < 4) return w[2];
                var res = w[3](this);
                this.cursor = c + w[0].length;
                if (res) return w[2];
            }
            i = w[1];
        } while (i >= 0);
        return 0;
    };

    // find_among_b is for backwards processing. Same comments apply
    this.find_among_b = function(v)
    {
        var i = 0;
        var j = v.length

        var c = this.cursor;
        var lb = this.limit_backward;

        var common_i = 0;
        var common_j = 0;

        var first_key_inspected = false;

        while (true)
        {
            var k = i + ((j - i) >> 1);
            var diff = 0;
            var common = common_i < common_j ? common_i : common_j;
            var w = v[k];
            var i2;
            for (i2 = w[0].length - 1 - common; i2 >= 0; i2--)
            {
                if (c - common == lb)
                {
                    diff = -1;
                    break;
                }
                diff = this.current.charCodeAt(c - 1 - common) - w[0].charCodeAt(i2);
                if (diff != 0) break;
                common++;
            }
            if (diff < 0)
            {
                j = k;
                common_j = common;
            }
            else
            {
                i = k;
                common_i = common;
            }
            if (j - i <= 1)
            {
                if (i > 0) break;
                if (j == i) break;
                if (first_key_inspected) break;
                first_key_inspected = true;
            }
        }
        do {
            var w = v[i];
            if (common_i >= w[0].length)
            {
                this.cursor = c - w[0].length;
                if (w.length < 4) return w[2];
                var res = w[3](this);
                this.cursor = c - w[0].length;
                if (res) return w[2];
            }
            i = w[1];
        } while (i >= 0);
        return 0;
    };

    /* to replace chars between c_bra and c_ket in this.current by the
     * chars in s.
     */
    this.replace_s = function(c_bra, c_ket, s)
    {
        var adjustment = s.length - (c_ket - c_bra);
        this.current = this.current.slice(0, c_bra) + s + this.current.slice(c_ket);
        this.limit += adjustment;
        if (this.cursor >= c_ket) this.cursor += adjustment;
        else if (this.cursor > c_bra) this.cursor = c_bra;
        return adjustment;
    };

    this.slice_check = function()
    {
        if (this.bra < 0 ||
            this.bra > this.ket ||
            this.ket > this.limit ||
            this.limit > this.current.length)
        {
            return false;
        }
        return true;
    };

    this.slice_from = function(s)
    {
        var result = false;
        if (this.slice_check())
        {
            this.replace_s(this.bra, this.ket, s);
            result = true;
        }
        return result;
    };

    this.slice_del = function()
    {
        return this.slice_from("");
    };

    this.insert = function(c_bra, c_ket, s)
    {
        var adjustment = this.replace_s(c_bra, c_ket, s);
        if (c_bra <= this.bra) this.bra += adjustment;
        if (c_bra <= this.ket) this.ket += adjustment;
    };

    this.slice_to = function()
    {
        var result = '';
        if (this.slice_check())
        {
            result = this.current.slice(this.bra, this.ket);
        }
        return result;
    };

    this.assign_to = function()
    {
        return this.current.slice(0, this.limit);
    };
};

// Generated by Snowball 2.1.0 - https://snowballstem.org/

/**@constructor*/
HungarianStemmer = function() {
    var base = new BaseStemmer();
    /** @const */ var a_0 = [
        ["cs", -1, -1],
        ["dzs", -1, -1],
        ["gy", -1, -1],
        ["ly", -1, -1],
        ["ny", -1, -1],
        ["sz", -1, -1],
        ["ty", -1, -1],
        ["zs", -1, -1]
    ];

    /** @const */ var a_1 = [
        ["\u00E1", -1, 1],
        ["\u00E9", -1, 2]
    ];

    /** @const */ var a_2 = [
        ["bb", -1, -1],
        ["cc", -1, -1],
        ["dd", -1, -1],
        ["ff", -1, -1],
        ["gg", -1, -1],
        ["jj", -1, -1],
        ["kk", -1, -1],
        ["ll", -1, -1],
        ["mm", -1, -1],
        ["nn", -1, -1],
        ["pp", -1, -1],
        ["rr", -1, -1],
        ["ccs", -1, -1],
        ["ss", -1, -1],
        ["zzs", -1, -1],
        ["tt", -1, -1],
        ["vv", -1, -1],
        ["ggy", -1, -1],
        ["lly", -1, -1],
        ["nny", -1, -1],
        ["tty", -1, -1],
        ["ssz", -1, -1],
        ["zz", -1, -1]
    ];

    /** @const */ var a_3 = [
        ["al", -1, 1],
        ["el", -1, 1]
    ];

    /** @const */ var a_4 = [
        ["ba", -1, -1],
        ["ra", -1, -1],
        ["be", -1, -1],
        ["re", -1, -1],
        ["ig", -1, -1],
        ["nak", -1, -1],
        ["nek", -1, -1],
        ["val", -1, -1],
        ["vel", -1, -1],
        ["ul", -1, -1],
        ["n\u00E1l", -1, -1],
        ["n\u00E9l", -1, -1],
        ["b\u00F3l", -1, -1],
        ["r\u00F3l", -1, -1],
        ["t\u00F3l", -1, -1],
        ["\u00FCl", -1, -1],
        ["b\u0151l", -1, -1],
        ["r\u0151l", -1, -1],
        ["t\u0151l", -1, -1],
        ["n", -1, -1],
        ["an", 19, -1],
        ["ban", 20, -1],
        ["en", 19, -1],
        ["ben", 22, -1],
        ["k\u00E9ppen", 22, -1],
        ["on", 19, -1],
        ["\u00F6n", 19, -1],
        ["k\u00E9pp", -1, -1],
        ["kor", -1, -1],
        ["t", -1, -1],
        ["at", 29, -1],
        ["et", 29, -1],
        ["k\u00E9nt", 29, -1],
        ["ank\u00E9nt", 32, -1],
        ["enk\u00E9nt", 32, -1],
        ["onk\u00E9nt", 32, -1],
        ["ot", 29, -1],
        ["\u00E9rt", 29, -1],
        ["\u00F6t", 29, -1],
        ["hez", -1, -1],
        ["hoz", -1, -1],
        ["h\u00F6z", -1, -1],
        ["v\u00E1", -1, -1],
        ["v\u00E9", -1, -1]
    ];

    /** @const */ var a_5 = [
        ["\u00E1n", -1, 2],
        ["\u00E9n", -1, 1],
        ["\u00E1nk\u00E9nt", -1, 2]
    ];

    /** @const */ var a_6 = [
        ["stul", -1, 1],
        ["astul", 0, 1],
        ["\u00E1stul", 0, 2],
        ["st\u00FCl", -1, 1],
        ["est\u00FCl", 3, 1],
        ["\u00E9st\u00FCl", 3, 3]
    ];

    /** @const */ var a_7 = [
        ["\u00E1", -1, 1],
        ["\u00E9", -1, 1]
    ];

    /** @const */ var a_8 = [
        ["k", -1, 3],
        ["ak", 0, 3],
        ["ek", 0, 3],
        ["ok", 0, 3],
        ["\u00E1k", 0, 1],
        ["\u00E9k", 0, 2],
        ["\u00F6k", 0, 3]
    ];

    /** @const */ var a_9 = [
        ["\u00E9i", -1, 1],
        ["\u00E1\u00E9i", 0, 3],
        ["\u00E9\u00E9i", 0, 2],
        ["\u00E9", -1, 1],
        ["k\u00E9", 3, 1],
        ["ak\u00E9", 4, 1],
        ["ek\u00E9", 4, 1],
        ["ok\u00E9", 4, 1],
        ["\u00E1k\u00E9", 4, 3],
        ["\u00E9k\u00E9", 4, 2],
        ["\u00F6k\u00E9", 4, 1],
        ["\u00E9\u00E9", 3, 2]
    ];

    /** @const */ var a_10 = [
        ["a", -1, 1],
        ["ja", 0, 1],
        ["d", -1, 1],
        ["ad", 2, 1],
        ["ed", 2, 1],
        ["od", 2, 1],
        ["\u00E1d", 2, 2],
        ["\u00E9d", 2, 3],
        ["\u00F6d", 2, 1],
        ["e", -1, 1],
        ["je", 9, 1],
        ["nk", -1, 1],
        ["unk", 11, 1],
        ["\u00E1nk", 11, 2],
        ["\u00E9nk", 11, 3],
        ["\u00FCnk", 11, 1],
        ["uk", -1, 1],
        ["juk", 16, 1],
        ["\u00E1juk", 17, 2],
        ["\u00FCk", -1, 1],
        ["j\u00FCk", 19, 1],
        ["\u00E9j\u00FCk", 20, 3],
        ["m", -1, 1],
        ["am", 22, 1],
        ["em", 22, 1],
        ["om", 22, 1],
        ["\u00E1m", 22, 2],
        ["\u00E9m", 22, 3],
        ["o", -1, 1],
        ["\u00E1", -1, 2],
        ["\u00E9", -1, 3]
    ];

    /** @const */ var a_11 = [
        ["id", -1, 1],
        ["aid", 0, 1],
        ["jaid", 1, 1],
        ["eid", 0, 1],
        ["jeid", 3, 1],
        ["\u00E1id", 0, 2],
        ["\u00E9id", 0, 3],
        ["i", -1, 1],
        ["ai", 7, 1],
        ["jai", 8, 1],
        ["ei", 7, 1],
        ["jei", 10, 1],
        ["\u00E1i", 7, 2],
        ["\u00E9i", 7, 3],
        ["itek", -1, 1],
        ["eitek", 14, 1],
        ["jeitek", 15, 1],
        ["\u00E9itek", 14, 3],
        ["ik", -1, 1],
        ["aik", 18, 1],
        ["jaik", 19, 1],
        ["eik", 18, 1],
        ["jeik", 21, 1],
        ["\u00E1ik", 18, 2],
        ["\u00E9ik", 18, 3],
        ["ink", -1, 1],
        ["aink", 25, 1],
        ["jaink", 26, 1],
        ["eink", 25, 1],
        ["jeink", 28, 1],
        ["\u00E1ink", 25, 2],
        ["\u00E9ink", 25, 3],
        ["aitok", -1, 1],
        ["jaitok", 32, 1],
        ["\u00E1itok", -1, 2],
        ["im", -1, 1],
        ["aim", 35, 1],
        ["jaim", 36, 1],
        ["eim", 35, 1],
        ["jeim", 38, 1],
        ["\u00E1im", 35, 2],
        ["\u00E9im", 35, 3]
    ];

    /** @const */ var /** Array<int> */ g_v = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 17, 36, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1];

    var /** number */ I_p1 = 0;


    /** @return {boolean} */
    function r_mark_regions() {
        I_p1 = base.limit;
        lab0: {
            var /** number */ v_1 = base.cursor;
            lab1: {
                if (!(base.in_grouping(g_v, 97, 369)))
                {
                    break lab1;
                }
                golab2: while(true)
                {
                    var /** number */ v_2 = base.cursor;
                    lab3: {
                        if (!(base.out_grouping(g_v, 97, 369)))
                        {
                            break lab3;
                        }
                        base.cursor = v_2;
                        break golab2;
                    }
                    base.cursor = v_2;
                    if (base.cursor >= base.limit)
                    {
                        break lab1;
                    }
                    base.cursor++;
                }
                lab4: {
                    var /** number */ v_3 = base.cursor;
                    lab5: {
                        if (base.find_among(a_0) == 0)
                        {
                            break lab5;
                        }
                        break lab4;
                    }
                    base.cursor = v_3;
                    if (base.cursor >= base.limit)
                    {
                        break lab1;
                    }
                    base.cursor++;
                }
                I_p1 = base.cursor;
                break lab0;
            }
            base.cursor = v_1;
            if (!(base.out_grouping(g_v, 97, 369)))
            {
                return false;
            }
            golab6: while(true)
            {
                lab7: {
                    if (!(base.in_grouping(g_v, 97, 369)))
                    {
                        break lab7;
                    }
                    break golab6;
                }
                if (base.cursor >= base.limit)
                {
                    return false;
                }
                base.cursor++;
            }
            I_p1 = base.cursor;
        }
        return true;
    };

    /** @return {boolean} */
    function r_R1() {
        if (!(I_p1 <= base.cursor))
        {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_v_ending() {
        var /** number */ among_var;
        base.ket = base.cursor;
        among_var = base.find_among_b(a_1);
        if (among_var == 0)
        {
            return false;
        }
        base.bra = base.cursor;
        if (!r_R1())
        {
            return false;
        }
        switch (among_var) {
            case 1:
                if (!base.slice_from("a"))
                {
                    return false;
                }
                break;
            case 2:
                if (!base.slice_from("e"))
                {
                    return false;
                }
                break;
        }
        return true;
    };

    /** @return {boolean} */
    function r_double() {
        var /** number */ v_1 = base.limit - base.cursor;
        if (base.find_among_b(a_2) == 0)
        {
            return false;
        }
        base.cursor = base.limit - v_1;
        return true;
    };

    /** @return {boolean} */
    function r_undouble() {
        if (base.cursor <= base.limit_backward)
        {
            return false;
        }
        base.cursor--;
        base.ket = base.cursor;
        {
            var /** number */ c1 = base.cursor - 1;
            if (c1 < base.limit_backward)
            {
                return false;
            }
            base.cursor = c1;
        }
        base.bra = base.cursor;
        if (!base.slice_del())
        {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_instrum() {
        base.ket = base.cursor;
        if (base.find_among_b(a_3) == 0)
        {
            return false;
        }
        base.bra = base.cursor;
        if (!r_R1())
        {
            return false;
        }
        if (!r_double())
        {
            return false;
        }
        if (!base.slice_del())
        {
            return false;
        }
        if (!r_undouble())
        {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_case() {
        base.ket = base.cursor;
        if (base.find_among_b(a_4) == 0)
        {
            return false;
        }
        base.bra = base.cursor;
        if (!r_R1())
        {
            return false;
        }
        if (!base.slice_del())
        {
            return false;
        }
        if (!r_v_ending())
        {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_case_special() {
        var /** number */ among_var;
        base.ket = base.cursor;
        among_var = base.find_among_b(a_5);
        if (among_var == 0)
        {
            return false;
        }
        base.bra = base.cursor;
        if (!r_R1())
        {
            return false;
        }
        switch (among_var) {
            case 1:
                if (!base.slice_from("e"))
                {
                    return false;
                }
                break;
            case 2:
                if (!base.slice_from("a"))
                {
                    return false;
                }
                break;
        }
        return true;
    };

    /** @return {boolean} */
    function r_case_other() {
        var /** number */ among_var;
        base.ket = base.cursor;
        among_var = base.find_among_b(a_6);
        if (among_var == 0)
        {
            return false;
        }
        base.bra = base.cursor;
        if (!r_R1())
        {
            return false;
        }
        switch (among_var) {
            case 1:
                if (!base.slice_del())
                {
                    return false;
                }
                break;
            case 2:
                if (!base.slice_from("a"))
                {
                    return false;
                }
                break;
            case 3:
                if (!base.slice_from("e"))
                {
                    return false;
                }
                break;
        }
        return true;
    };

    /** @return {boolean} */
    function r_factive() {
        base.ket = base.cursor;
        if (base.find_among_b(a_7) == 0)
        {
            return false;
        }
        base.bra = base.cursor;
        if (!r_R1())
        {
            return false;
        }
        if (!r_double())
        {
            return false;
        }
        if (!base.slice_del())
        {
            return false;
        }
        if (!r_undouble())
        {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_plural() {
        var /** number */ among_var;
        base.ket = base.cursor;
        among_var = base.find_among_b(a_8);
        if (among_var == 0)
        {
            return false;
        }
        base.bra = base.cursor;
        if (!r_R1())
        {
            return false;
        }
        switch (among_var) {
            case 1:
                if (!base.slice_from("a"))
                {
                    return false;
                }
                break;
            case 2:
                if (!base.slice_from("e"))
                {
                    return false;
                }
                break;
            case 3:
                if (!base.slice_del())
                {
                    return false;
                }
                break;
        }
        return true;
    };

    /** @return {boolean} */
    function r_owned() {
        var /** number */ among_var;
        base.ket = base.cursor;
        among_var = base.find_among_b(a_9);
        if (among_var == 0)
        {
            return false;
        }
        base.bra = base.cursor;
        if (!r_R1())
        {
            return false;
        }
        switch (among_var) {
            case 1:
                if (!base.slice_del())
                {
                    return false;
                }
                break;
            case 2:
                if (!base.slice_from("e"))
                {
                    return false;
                }
                break;
            case 3:
                if (!base.slice_from("a"))
                {
                    return false;
                }
                break;
        }
        return true;
    };

    /** @return {boolean} */
    function r_sing_owner() {
        var /** number */ among_var;
        base.ket = base.cursor;
        among_var = base.find_among_b(a_10);
        if (among_var == 0)
        {
            return false;
        }
        base.bra = base.cursor;
        if (!r_R1())
        {
            return false;
        }
        switch (among_var) {
            case 1:
                if (!base.slice_del())
                {
                    return false;
                }
                break;
            case 2:
                if (!base.slice_from("a"))
                {
                    return false;
                }
                break;
            case 3:
                if (!base.slice_from("e"))
                {
                    return false;
                }
                break;
        }
        return true;
    };

    /** @return {boolean} */
    function r_plur_owner() {
        var /** number */ among_var;
        base.ket = base.cursor;
        among_var = base.find_among_b(a_11);
        if (among_var == 0)
        {
            return false;
        }
        base.bra = base.cursor;
        if (!r_R1())
        {
            return false;
        }
        switch (among_var) {
            case 1:
                if (!base.slice_del())
                {
                    return false;
                }
                break;
            case 2:
                if (!base.slice_from("a"))
                {
                    return false;
                }
                break;
            case 3:
                if (!base.slice_from("e"))
                {
                    return false;
                }
                break;
        }
        return true;
    };

    this.stem = /** @return {boolean} */ function() {
        var /** number */ v_1 = base.cursor;
        r_mark_regions();
        base.cursor = v_1;
        base.limit_backward = base.cursor; base.cursor = base.limit;
        var /** number */ v_2 = base.limit - base.cursor;
        r_instrum();
        base.cursor = base.limit - v_2;
        var /** number */ v_3 = base.limit - base.cursor;
        r_case();
        base.cursor = base.limit - v_3;
        var /** number */ v_4 = base.limit - base.cursor;
        r_case_special();
        base.cursor = base.limit - v_4;
        var /** number */ v_5 = base.limit - base.cursor;
        r_case_other();
        base.cursor = base.limit - v_5;
        var /** number */ v_6 = base.limit - base.cursor;
        r_factive();
        base.cursor = base.limit - v_6;
        var /** number */ v_7 = base.limit - base.cursor;
        r_owned();
        base.cursor = base.limit - v_7;
        var /** number */ v_8 = base.limit - base.cursor;
        r_sing_owner();
        base.cursor = base.limit - v_8;
        var /** number */ v_9 = base.limit - base.cursor;
        r_plur_owner();
        base.cursor = base.limit - v_9;
        var /** number */ v_10 = base.limit - base.cursor;
        r_plural();
        base.cursor = base.limit - v_10;
        base.cursor = base.limit_backward;
        return true;
    };

    /**@return{string}*/
    this['stemWord'] = function(/**string*/word) {
        base.setCurrent(word);
        this.stem();
        return base.getCurrent();
    };
};

Stemmer = HungarianStemmer;
