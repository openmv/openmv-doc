/*
 * This script contains the language-specific data used by searchtools.js,
 * namely the list of stopwords, stemmer, scorer and splitter.
 */

var stopwords = ["ei", "eiv\u00e4t", "emme", "en", "et", "ette", "ett\u00e4", "he", "heid\u00e4n", "heid\u00e4t", "heihin", "heille", "heill\u00e4", "heilt\u00e4", "heiss\u00e4", "heist\u00e4", "heit\u00e4", "h\u00e4n", "h\u00e4neen", "h\u00e4nelle", "h\u00e4nell\u00e4", "h\u00e4nelt\u00e4", "h\u00e4nen", "h\u00e4ness\u00e4", "h\u00e4nest\u00e4", "h\u00e4net", "h\u00e4nt\u00e4", "itse", "ja", "johon", "joiden", "joihin", "joiksi", "joilla", "joille", "joilta", "joina", "joissa", "joista", "joita", "joka", "joksi", "jolla", "jolle", "jolta", "jona", "jonka", "jos", "jossa", "josta", "jota", "jotka", "kanssa", "keiden", "keihin", "keiksi", "keille", "keill\u00e4", "keilt\u00e4", "kein\u00e4", "keiss\u00e4", "keist\u00e4", "keit\u00e4", "keneen", "keneksi", "kenelle", "kenell\u00e4", "kenelt\u00e4", "kenen", "kenen\u00e4", "keness\u00e4", "kenest\u00e4", "kenet", "ketk\u00e4", "ket\u00e4", "koska", "kuin", "kuka", "kun", "me", "meid\u00e4n", "meid\u00e4t", "meihin", "meille", "meill\u00e4", "meilt\u00e4", "meiss\u00e4", "meist\u00e4", "meit\u00e4", "mihin", "miksi", "mik\u00e4", "mille", "mill\u00e4", "milt\u00e4", "mink\u00e4", "minua", "minulla", "minulle", "minulta", "minun", "minussa", "minusta", "minut", "minuun", "min\u00e4", "miss\u00e4", "mist\u00e4", "mitk\u00e4", "mit\u00e4", "mukaan", "mutta", "ne", "niiden", "niihin", "niiksi", "niille", "niill\u00e4", "niilt\u00e4", "niin", "niin\u00e4", "niiss\u00e4", "niist\u00e4", "niit\u00e4", "noiden", "noihin", "noiksi", "noilla", "noille", "noilta", "noin", "noina", "noissa", "noista", "noita", "nuo", "nyt", "n\u00e4iden", "n\u00e4ihin", "n\u00e4iksi", "n\u00e4ille", "n\u00e4ill\u00e4", "n\u00e4ilt\u00e4", "n\u00e4in\u00e4", "n\u00e4iss\u00e4", "n\u00e4ist\u00e4", "n\u00e4it\u00e4", "n\u00e4m\u00e4", "ole", "olemme", "olen", "olet", "olette", "oli", "olimme", "olin", "olisi", "olisimme", "olisin", "olisit", "olisitte", "olisivat", "olit", "olitte", "olivat", "olla", "olleet", "ollut", "on", "ovat", "poikki", "se", "sek\u00e4", "sen", "siihen", "siin\u00e4", "siit\u00e4", "siksi", "sille", "sill\u00e4", "silt\u00e4", "sinua", "sinulla", "sinulle", "sinulta", "sinun", "sinussa", "sinusta", "sinut", "sinuun", "sin\u00e4", "sit\u00e4", "tai", "te", "teid\u00e4n", "teid\u00e4t", "teihin", "teille", "teill\u00e4", "teilt\u00e4", "teiss\u00e4", "teist\u00e4", "teit\u00e4", "tuo", "tuohon", "tuoksi", "tuolla", "tuolle", "tuolta", "tuon", "tuona", "tuossa", "tuosta", "tuota", "t\u00e4h\u00e4n", "t\u00e4ksi", "t\u00e4lle", "t\u00e4ll\u00e4", "t\u00e4lt\u00e4", "t\u00e4m\u00e4", "t\u00e4m\u00e4n", "t\u00e4n\u00e4", "t\u00e4ss\u00e4", "t\u00e4st\u00e4", "t\u00e4t\u00e4", "vaan", "vai", "vaikka", "yli"];


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
FinnishStemmer = function() {
    var base = new BaseStemmer();
    /** @const */ var a_0 = [
        ["pa", -1, 1],
        ["sti", -1, 2],
        ["kaan", -1, 1],
        ["han", -1, 1],
        ["kin", -1, 1],
        ["h\u00E4n", -1, 1],
        ["k\u00E4\u00E4n", -1, 1],
        ["ko", -1, 1],
        ["p\u00E4", -1, 1],
        ["k\u00F6", -1, 1]
    ];

    /** @const */ var a_1 = [
        ["lla", -1, -1],
        ["na", -1, -1],
        ["ssa", -1, -1],
        ["ta", -1, -1],
        ["lta", 3, -1],
        ["sta", 3, -1]
    ];

    /** @const */ var a_2 = [
        ["ll\u00E4", -1, -1],
        ["n\u00E4", -1, -1],
        ["ss\u00E4", -1, -1],
        ["t\u00E4", -1, -1],
        ["lt\u00E4", 3, -1],
        ["st\u00E4", 3, -1]
    ];

    /** @const */ var a_3 = [
        ["lle", -1, -1],
        ["ine", -1, -1]
    ];

    /** @const */ var a_4 = [
        ["nsa", -1, 3],
        ["mme", -1, 3],
        ["nne", -1, 3],
        ["ni", -1, 2],
        ["si", -1, 1],
        ["an", -1, 4],
        ["en", -1, 6],
        ["\u00E4n", -1, 5],
        ["ns\u00E4", -1, 3]
    ];

    /** @const */ var a_5 = [
        ["aa", -1, -1],
        ["ee", -1, -1],
        ["ii", -1, -1],
        ["oo", -1, -1],
        ["uu", -1, -1],
        ["\u00E4\u00E4", -1, -1],
        ["\u00F6\u00F6", -1, -1]
    ];

    /** @const */ var a_6 = [
        ["a", -1, 8],
        ["lla", 0, -1],
        ["na", 0, -1],
        ["ssa", 0, -1],
        ["ta", 0, -1],
        ["lta", 4, -1],
        ["sta", 4, -1],
        ["tta", 4, 2],
        ["lle", -1, -1],
        ["ine", -1, -1],
        ["ksi", -1, -1],
        ["n", -1, 7],
        ["han", 11, 1],
        ["den", 11, -1, r_VI],
        ["seen", 11, -1, r_LONG],
        ["hen", 11, 2],
        ["tten", 11, -1, r_VI],
        ["hin", 11, 3],
        ["siin", 11, -1, r_VI],
        ["hon", 11, 4],
        ["h\u00E4n", 11, 5],
        ["h\u00F6n", 11, 6],
        ["\u00E4", -1, 8],
        ["ll\u00E4", 22, -1],
        ["n\u00E4", 22, -1],
        ["ss\u00E4", 22, -1],
        ["t\u00E4", 22, -1],
        ["lt\u00E4", 26, -1],
        ["st\u00E4", 26, -1],
        ["tt\u00E4", 26, 2]
    ];

    /** @const */ var a_7 = [
        ["eja", -1, -1],
        ["mma", -1, 1],
        ["imma", 1, -1],
        ["mpa", -1, 1],
        ["impa", 3, -1],
        ["mmi", -1, 1],
        ["immi", 5, -1],
        ["mpi", -1, 1],
        ["impi", 7, -1],
        ["ej\u00E4", -1, -1],
        ["mm\u00E4", -1, 1],
        ["imm\u00E4", 10, -1],
        ["mp\u00E4", -1, 1],
        ["imp\u00E4", 12, -1]
    ];

    /** @const */ var a_8 = [
        ["i", -1, -1],
        ["j", -1, -1]
    ];

    /** @const */ var a_9 = [
        ["mma", -1, 1],
        ["imma", 0, -1]
    ];

    /** @const */ var /** Array<int> */ g_AEI = [17, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8];

    /** @const */ var /** Array<int> */ g_C = [119, 223, 119, 1];

    /** @const */ var /** Array<int> */ g_V1 = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 32];

    /** @const */ var /** Array<int> */ g_V2 = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 32];

    /** @const */ var /** Array<int> */ g_particle_end = [17, 97, 24, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 32];

    var /** boolean */ B_ending_removed = false;
    var /** string */ S_x = '';
    var /** number */ I_p2 = 0;
    var /** number */ I_p1 = 0;


    /** @return {boolean} */
    function r_mark_regions() {
        I_p1 = base.limit;
        I_p2 = base.limit;
        golab0: while(true)
        {
            var /** number */ v_1 = base.cursor;
            lab1: {
                if (!(base.in_grouping(g_V1, 97, 246)))
                {
                    break lab1;
                }
                base.cursor = v_1;
                break golab0;
            }
            base.cursor = v_1;
            if (base.cursor >= base.limit)
            {
                return false;
            }
            base.cursor++;
        }
        golab2: while(true)
        {
            lab3: {
                if (!(base.out_grouping(g_V1, 97, 246)))
                {
                    break lab3;
                }
                break golab2;
            }
            if (base.cursor >= base.limit)
            {
                return false;
            }
            base.cursor++;
        }
        I_p1 = base.cursor;
        golab4: while(true)
        {
            var /** number */ v_3 = base.cursor;
            lab5: {
                if (!(base.in_grouping(g_V1, 97, 246)))
                {
                    break lab5;
                }
                base.cursor = v_3;
                break golab4;
            }
            base.cursor = v_3;
            if (base.cursor >= base.limit)
            {
                return false;
            }
            base.cursor++;
        }
        golab6: while(true)
        {
            lab7: {
                if (!(base.out_grouping(g_V1, 97, 246)))
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
        I_p2 = base.cursor;
        return true;
    };

    /** @return {boolean} */
    function r_R2() {
        if (!(I_p2 <= base.cursor))
        {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_particle_etc() {
        var /** number */ among_var;
        if (base.cursor < I_p1)
        {
            return false;
        }
        var /** number */ v_2 = base.limit_backward;
        base.limit_backward = I_p1;
        base.ket = base.cursor;
        among_var = base.find_among_b(a_0);
        if (among_var == 0)
        {
            base.limit_backward = v_2;
            return false;
        }
        base.bra = base.cursor;
        base.limit_backward = v_2;
        switch (among_var) {
            case 1:
                if (!(base.in_grouping_b(g_particle_end, 97, 246)))
                {
                    return false;
                }
                break;
            case 2:
                if (!r_R2())
                {
                    return false;
                }
                break;
        }
        if (!base.slice_del())
        {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_possessive() {
        var /** number */ among_var;
        if (base.cursor < I_p1)
        {
            return false;
        }
        var /** number */ v_2 = base.limit_backward;
        base.limit_backward = I_p1;
        base.ket = base.cursor;
        among_var = base.find_among_b(a_4);
        if (among_var == 0)
        {
            base.limit_backward = v_2;
            return false;
        }
        base.bra = base.cursor;
        base.limit_backward = v_2;
        switch (among_var) {
            case 1:
                {
                    var /** number */ v_3 = base.limit - base.cursor;
                    lab0: {
                        if (!(base.eq_s_b("k")))
                        {
                            break lab0;
                        }
                        return false;
                    }
                    base.cursor = base.limit - v_3;
                }
                if (!base.slice_del())
                {
                    return false;
                }
                break;
            case 2:
                if (!base.slice_del())
                {
                    return false;
                }
                base.ket = base.cursor;
                if (!(base.eq_s_b("kse")))
                {
                    return false;
                }
                base.bra = base.cursor;
                if (!base.slice_from("ksi"))
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
            case 4:
                if (base.find_among_b(a_1) == 0)
                {
                    return false;
                }
                if (!base.slice_del())
                {
                    return false;
                }
                break;
            case 5:
                if (base.find_among_b(a_2) == 0)
                {
                    return false;
                }
                if (!base.slice_del())
                {
                    return false;
                }
                break;
            case 6:
                if (base.find_among_b(a_3) == 0)
                {
                    return false;
                }
                if (!base.slice_del())
                {
                    return false;
                }
                break;
        }
        return true;
    };

    /** @return {boolean} */
    function r_LONG() {
        if (base.find_among_b(a_5) == 0)
        {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_VI() {
        if (!(base.eq_s_b("i")))
        {
            return false;
        }
        if (!(base.in_grouping_b(g_V2, 97, 246)))
        {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_case_ending() {
        var /** number */ among_var;
        if (base.cursor < I_p1)
        {
            return false;
        }
        var /** number */ v_2 = base.limit_backward;
        base.limit_backward = I_p1;
        base.ket = base.cursor;
        among_var = base.find_among_b(a_6);
        if (among_var == 0)
        {
            base.limit_backward = v_2;
            return false;
        }
        base.bra = base.cursor;
        base.limit_backward = v_2;
        switch (among_var) {
            case 1:
                if (!(base.eq_s_b("a")))
                {
                    return false;
                }
                break;
            case 2:
                if (!(base.eq_s_b("e")))
                {
                    return false;
                }
                break;
            case 3:
                if (!(base.eq_s_b("i")))
                {
                    return false;
                }
                break;
            case 4:
                if (!(base.eq_s_b("o")))
                {
                    return false;
                }
                break;
            case 5:
                if (!(base.eq_s_b("\u00E4")))
                {
                    return false;
                }
                break;
            case 6:
                if (!(base.eq_s_b("\u00F6")))
                {
                    return false;
                }
                break;
            case 7:
                var /** number */ v_3 = base.limit - base.cursor;
                lab0: {
                    var /** number */ v_4 = base.limit - base.cursor;
                    lab1: {
                        var /** number */ v_5 = base.limit - base.cursor;
                        lab2: {
                            if (!r_LONG())
                            {
                                break lab2;
                            }
                            break lab1;
                        }
                        base.cursor = base.limit - v_5;
                        if (!(base.eq_s_b("ie")))
                        {
                            base.cursor = base.limit - v_3;
                            break lab0;
                        }
                    }
                    base.cursor = base.limit - v_4;
                    if (base.cursor <= base.limit_backward)
                    {
                        base.cursor = base.limit - v_3;
                        break lab0;
                    }
                    base.cursor--;
                    base.bra = base.cursor;
                }
                break;
            case 8:
                if (!(base.in_grouping_b(g_V1, 97, 246)))
                {
                    return false;
                }
                if (!(base.in_grouping_b(g_C, 98, 122)))
                {
                    return false;
                }
                break;
        }
        if (!base.slice_del())
        {
            return false;
        }
        B_ending_removed = true;
        return true;
    };

    /** @return {boolean} */
    function r_other_endings() {
        var /** number */ among_var;
        if (base.cursor < I_p2)
        {
            return false;
        }
        var /** number */ v_2 = base.limit_backward;
        base.limit_backward = I_p2;
        base.ket = base.cursor;
        among_var = base.find_among_b(a_7);
        if (among_var == 0)
        {
            base.limit_backward = v_2;
            return false;
        }
        base.bra = base.cursor;
        base.limit_backward = v_2;
        switch (among_var) {
            case 1:
                {
                    var /** number */ v_3 = base.limit - base.cursor;
                    lab0: {
                        if (!(base.eq_s_b("po")))
                        {
                            break lab0;
                        }
                        return false;
                    }
                    base.cursor = base.limit - v_3;
                }
                break;
        }
        if (!base.slice_del())
        {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_i_plural() {
        if (base.cursor < I_p1)
        {
            return false;
        }
        var /** number */ v_2 = base.limit_backward;
        base.limit_backward = I_p1;
        base.ket = base.cursor;
        if (base.find_among_b(a_8) == 0)
        {
            base.limit_backward = v_2;
            return false;
        }
        base.bra = base.cursor;
        base.limit_backward = v_2;
        if (!base.slice_del())
        {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_t_plural() {
        var /** number */ among_var;
        if (base.cursor < I_p1)
        {
            return false;
        }
        var /** number */ v_2 = base.limit_backward;
        base.limit_backward = I_p1;
        base.ket = base.cursor;
        if (!(base.eq_s_b("t")))
        {
            base.limit_backward = v_2;
            return false;
        }
        base.bra = base.cursor;
        var /** number */ v_3 = base.limit - base.cursor;
        if (!(base.in_grouping_b(g_V1, 97, 246)))
        {
            base.limit_backward = v_2;
            return false;
        }
        base.cursor = base.limit - v_3;
        if (!base.slice_del())
        {
            return false;
        }
        base.limit_backward = v_2;
        if (base.cursor < I_p2)
        {
            return false;
        }
        var /** number */ v_5 = base.limit_backward;
        base.limit_backward = I_p2;
        base.ket = base.cursor;
        among_var = base.find_among_b(a_9);
        if (among_var == 0)
        {
            base.limit_backward = v_5;
            return false;
        }
        base.bra = base.cursor;
        base.limit_backward = v_5;
        switch (among_var) {
            case 1:
                {
                    var /** number */ v_6 = base.limit - base.cursor;
                    lab0: {
                        if (!(base.eq_s_b("po")))
                        {
                            break lab0;
                        }
                        return false;
                    }
                    base.cursor = base.limit - v_6;
                }
                break;
        }
        if (!base.slice_del())
        {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_tidy() {
        if (base.cursor < I_p1)
        {
            return false;
        }
        var /** number */ v_2 = base.limit_backward;
        base.limit_backward = I_p1;
        var /** number */ v_3 = base.limit - base.cursor;
        lab0: {
            var /** number */ v_4 = base.limit - base.cursor;
            if (!r_LONG())
            {
                break lab0;
            }
            base.cursor = base.limit - v_4;
            base.ket = base.cursor;
            if (base.cursor <= base.limit_backward)
            {
                break lab0;
            }
            base.cursor--;
            base.bra = base.cursor;
            if (!base.slice_del())
            {
                return false;
            }
        }
        base.cursor = base.limit - v_3;
        var /** number */ v_5 = base.limit - base.cursor;
        lab1: {
            base.ket = base.cursor;
            if (!(base.in_grouping_b(g_AEI, 97, 228)))
            {
                break lab1;
            }
            base.bra = base.cursor;
            if (!(base.in_grouping_b(g_C, 98, 122)))
            {
                break lab1;
            }
            if (!base.slice_del())
            {
                return false;
            }
        }
        base.cursor = base.limit - v_5;
        var /** number */ v_6 = base.limit - base.cursor;
        lab2: {
            base.ket = base.cursor;
            if (!(base.eq_s_b("j")))
            {
                break lab2;
            }
            base.bra = base.cursor;
            lab3: {
                var /** number */ v_7 = base.limit - base.cursor;
                lab4: {
                    if (!(base.eq_s_b("o")))
                    {
                        break lab4;
                    }
                    break lab3;
                }
                base.cursor = base.limit - v_7;
                if (!(base.eq_s_b("u")))
                {
                    break lab2;
                }
            }
            if (!base.slice_del())
            {
                return false;
            }
        }
        base.cursor = base.limit - v_6;
        var /** number */ v_8 = base.limit - base.cursor;
        lab5: {
            base.ket = base.cursor;
            if (!(base.eq_s_b("o")))
            {
                break lab5;
            }
            base.bra = base.cursor;
            if (!(base.eq_s_b("j")))
            {
                break lab5;
            }
            if (!base.slice_del())
            {
                return false;
            }
        }
        base.cursor = base.limit - v_8;
        base.limit_backward = v_2;
        golab6: while(true)
        {
            var /** number */ v_9 = base.limit - base.cursor;
            lab7: {
                if (!(base.out_grouping_b(g_V1, 97, 246)))
                {
                    break lab7;
                }
                base.cursor = base.limit - v_9;
                break golab6;
            }
            base.cursor = base.limit - v_9;
            if (base.cursor <= base.limit_backward)
            {
                return false;
            }
            base.cursor--;
        }
        base.ket = base.cursor;
        if (!(base.in_grouping_b(g_C, 98, 122)))
        {
            return false;
        }
        base.bra = base.cursor;
        S_x = base.slice_to();
        if (S_x == '')
        {
            return false;
        }
        if (!(base.eq_s_b(S_x)))
        {
            return false;
        }
        if (!base.slice_del())
        {
            return false;
        }
        return true;
    };

    this.stem = /** @return {boolean} */ function() {
        var /** number */ v_1 = base.cursor;
        r_mark_regions();
        base.cursor = v_1;
        B_ending_removed = false;
        base.limit_backward = base.cursor; base.cursor = base.limit;
        var /** number */ v_2 = base.limit - base.cursor;
        r_particle_etc();
        base.cursor = base.limit - v_2;
        var /** number */ v_3 = base.limit - base.cursor;
        r_possessive();
        base.cursor = base.limit - v_3;
        var /** number */ v_4 = base.limit - base.cursor;
        r_case_ending();
        base.cursor = base.limit - v_4;
        var /** number */ v_5 = base.limit - base.cursor;
        r_other_endings();
        base.cursor = base.limit - v_5;
        lab0: {
            lab1: {
                if (!B_ending_removed)
                {
                    break lab1;
                }
                var /** number */ v_7 = base.limit - base.cursor;
                r_i_plural();
                base.cursor = base.limit - v_7;
                break lab0;
            }
            var /** number */ v_8 = base.limit - base.cursor;
            r_t_plural();
            base.cursor = base.limit - v_8;
        }
        var /** number */ v_9 = base.limit - base.cursor;
        r_tidy();
        base.cursor = base.limit - v_9;
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

Stemmer = FinnishStemmer;
