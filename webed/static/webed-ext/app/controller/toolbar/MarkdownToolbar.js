Ext.define ('Webed.controller.toolbar.MarkdownToolbar', {
    extend: 'Webed.controller.toolbar.TextToolbar',

    refs: [{
        selector: 'md-toolbar', ref: 'toolbar'
    }],

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    init: function () {
        this.control ({
            'md-toolbar component[action=undo]': {
                click: this.undo
            },
            'md-toolbar component[action=redo]': {
                click: this.redo
            },
            'md-toolbar component[action=cut]': {
                click: this.cut
            },
            'md-toolbar component[action=copy]': {
                click: this.copy
            },
            'md-toolbar component[action=paste]': {
                click: this.paste
            },

            'md-toolbar component[action=apply-heading-0]': {
                click: function (button) {
                    EDITOR = assert (this.codemirror (button));
                }
            },
            'md-toolbar menuitem[action=apply-heading-1]': {
                click: Ext.pass (this.apply_heading, [1], this)
            },
            'md-toolbar menuitem[action=apply-heading-2]': {
                click: Ext.pass (this.apply_heading, [2], this)
            },

            'md-toolbar component[action=toggle-strong]': {
                click: this.toggle_strong
            },
            'md-toolbar component[action=toggle-italic]': {
                click: this.toggle_italic
            },
            'md-toolbar component[action=toggle-literal]': {
                click: this.toggle_literal
            },

            'md-toolbar component[action=toggle-subscript]': {
                click: this.toggle_subscript
            },
            'md-toolbar component[action=toggle-supscript]': {
                click: this.toggle_supscript
            },

            'md-toolbar component[action=lower-case]': {
                click: this.lower_case
            },
            'md-toolbar component[action=upper-case]': {
                click: this.upper_case
            },

            'md-toolbar component[action=decrease-indent]': {
                click: this.decrease_indent
            },
            'md-toolbar component[action=increase-indent]': {
                click: this.increase_indent
            },

            'md-toolbar component[action=toggle-bullet-list]': {
                click: this.toggle_bullet_list
            },
            'md-toolbar component[action=toggle-number-list]': {
                click: this.toggle_number_list
            },

            'md-toolbar component[action=insert-hyperlink]': {
                click: this.insert_hyperlink
            },
            'md-toolbar component[action=insert-horizontal-line]': {
                click: this.insert_horizontal_line
            },

            'md-toolbar component[action=split-vertical]': {
                click: this.split_vertical
            },
            'md-toolbar component[action=split-horizontal]': {
                click: this.split_horizontal
            },

            'md-toolbar component[action=find]': {
                click: this.find
            },
            'md-toolbar component[action=find-next]': {
                click: this.find_next
            },
            'md-toolbar component[action=find-previous]': {
                click: this.find_previous
            },
            'md-toolbar component[action=replace-all]': {
                click: this.replace_all
            },
            'md-toolbar component[action=clear-search]': {
                click: this.clear_search
            },

            'md-toolbar': {
                afterrender: this.afterrender
            }
        });
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    afterrender: function (self) {
        this.keyMap = Ext.create (
            'Webed.controller.toolbar.MarkdownToolbar.KeyMap', {toolbar: self}
        );
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    heading_marker: function (level) {
        return {1:'=', 2:'-'}[level];
    },

    apply_heading: function (level, button) {
        var editor = assert (this.get_editor (button));
        var marker = assert (this.heading_marker (level));

        switch (level) {
            case 1:
            case 2:
                apply_heading_1to2.call (this, marker, level);
                break;
            default:
                return;
        }

        function apply_heading_1to2 (marker, level) {
            this.remove_heading (editor, function () {
                var sel = editor.getSelection ();
                if (sel) {
                    var head = '';
                    var size = sel.length;
                    for (var idx = 0; idx < size; idx++) head += marker;
                    var tpl = '{1}\n{0}';
                    editor.replaceSelection (String.format (tpl, head, sel));
                    editor.setCursor (editor.getCursor ('end'));
                }
            });
        }

        editor.focus ();
    },

    remove_heading: function (editor, callback) {
        var beg = editor.getCursor ('head');
        var end = editor.getCursor ('end');
        var tok = [], upp, low;

        for (var n = -3; n < 3; n++) {
            tok[n] = editor.getTokenAt ({line:end.line + n,ch:1});
            tok[n].line = end.line + n;

            if (tok[n].className == 'header') {
                if (upp) { low = tok[n]; } else { upp = tok[n]; }
            }
        }

        var sel = editor.getSelection ();
        if (sel) {
            if (tok[-3] && tok[-3].className == 'header' && !low) return;
            if (tok[-2] && tok[-2].className == 'header' && !low) return;
            if (low) editor.removeLine (low.line);
            if (upp) editor.removeLine (upp.line);

            reset_cursor.call (this);

            var cur = editor.getCursor ('head');
            var txt = editor.getLine (cur.line);

            editor.setSelection (
                {line:cur.line, ch:0}, {line:cur.line, ch:txt.length}
            );

            if (callback) callback.call (this);
        }

        function reset_cursor () {
            if (upp && low)
                editor.setCursor ({line:upp.line - 0, ch:0});
            else if (upp || low)
                editor.setCursor ({line:upp.line - 1, ch:0});
            else if (beg.line == end.line)
                editor.setCursor ({line:beg.line - 0, ch:0});
            else
                editor.setCursor ({line:end.line - 1, ch:0});
        }
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    toggle_strong: function (button) {
        var editor = assert (this.get_editor (button));
        if (editor.cfg_strong == undefined)
            editor.cfg_strong = this.toggle_cfg ('strong', '**', '**');
        this.toggle_inline (editor, editor.cfg_strong);
        editor.focus ();
    },

    toggle_italic: function (button) {
        var editor = assert (this.get_editor (button));
        if (editor.cfg_italic == undefined)
            editor.cfg_italic = this.toggle_cfg ('em', '*', '*');
        this.toggle_inline (editor, editor.cfg_italic);
        editor.focus ();
    },

    toggle_literal: function (button) {
        var editor = assert (this.get_editor (button));
        if (editor.cfg_literal == undefined)
            editor.cfg_literal = this.toggle_cfg ('string-2', '``', '``');
        this.toggle_inline (editor, editor.cfg_literal);
        editor.focus ();
    },

    toggle_subscript: function (button) {
        var editor = assert (this.get_editor (button));
        if (editor.cfg_subscript == undefined)
            editor.cfg_subscript = this.toggle_cfg ('meta', ':sub:`', '`');
        this.toggle_inline (editor, editor.cfg_subscript);
        editor.focus ();
    },

    toggle_supscript: function (button) {
        var editor = assert (this.get_editor (button));
        if (editor.cfg_supscript == undefined)
            editor.cfg_supscript = this.toggle_cfg ('meta', ':sup:`', '`');
        this.toggle_inline (editor, editor.cfg_supscript);
        editor.focus ();
    },

    ///////////////////////////////////////////////////////////////////////////

    toggle_inline: function (editor, cfg) {
        var cur = editor.getCursor ('end');
        var tok = editor.getTokenAt (cur);
        var sel = editor.getSelection ();

        if (sel && sel.length > 0) {
            if (tok.className == cfg.cls && !sel.match (cfg.inline))
                return; // no toggle if not all selected
            if (tok.className != cfg.cls && tok.className)
                return; // no toggle if something else

            var rep = undefined;
            if (sel.match (cfg.inline)) {
                rep = sel.replace (cfg.rx_marker_beg, '');
                rep = rep.replace (cfg.rx_marker_end, '');
            } else {
                if (sel.match (/^:(.*?):`(.*)`$/))
                    return; // no toggle if another role
                else if (sel.match (/^\s+|\s+$/))
                    return; // no toggle if heading/trailing space
                else
                    rep = String.format (
                        '{0}{1}{2}', cfg.marker_beg, sel, cfg.marker_end
                    );
            }

            editor.replaceSelection (rep);
        }
    },

    toggle_cfg: function (cls, beg, end) {
        var rx = /([\.\?\*\+\^\$\[\]\(\)\{\}\|\-\\])/g;
        var quote = function (value) { return (value).replace (rx, '\\$1'); };

        return {
            cls: cls,
            marker_beg: beg,
            marker_end: end,
            rx_marker_beg: new RegExp ('^' + quote (beg)),
            rx_marker_end: new RegExp (quote (end) + '$'),
            inline: new RegExp ('^'+ quote (beg) + '(?:.*)' + quote (end) +'$')
        }
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    toggle_bullet_list: function (button) {
        var editor = assert (this.get_editor (button));
        var sel = editor.getSelection ();
        if (sel) this.all_points (
            editor, '+ ', /^(\s*)(\+)(\s+)/, /^(\s*)(.*)/, sel
        );

        else this.next_point (editor, '\n{0}+ \n', /^(\s*)\+(\s+)$/);
    },

    toggle_number_list: function (button) {
        var editor = assert (this.get_editor (button));
        var sel = editor.getSelection ();
        if (sel) this.all_points (
            editor, '{0}. ', /^(\s*)([#0-9]+\.)(\s+)/, /^(\s*)(.*)/, sel
        );

        else this.next_point (editor, '\n{0}1. \n', /^(\s*)[#0-9]\.(\s+)$/);
    },

    all_points: function (editor, tpl, rx1, rx2, sel) {
        var rest = ''; CodeMirror.splitLines (sel)
            .filter(function (el) { return el; })
            .forEach(function (el, idx) {

                var rx1_group = el.match (rx1);
                if (rx1_group) {
                    rest += rx1_group[1]+ el.replace (rx1_group[0], '') +'\n';
                } else {
                    var rx2_group = el.match (rx2);
                    if (rx2_group) rest += String.format ('{0}{1}{2}\n',
                        rx2_group[1], String.format (tpl, idx+1), rx2_group[2]
                    );
                }
            });

        editor.replaceSelection (rest);
        editor.focus ();
    },

    next_point: function  (editor, tpl, rx) {
        var curr = editor.getCursor ();
        var text = editor.getLine (curr.line);
        var rest = tpl;

        var group = text.match (/^(\s+)/);
        if (group && group[0])
            rest = String.format (rest, group[0]);
        else
            rest = String.format (rest, '');

        rest = this.fix_preceeding_whitespace (editor, rest, text, curr);
        rest = this.fix_succeeding_whitespace (editor, rest, text, curr);
        editor.replaceSelection (rest);

        curr = editor.getCursor ('head');
        text = editor.getLine (curr.line);
        if (!text.match (rx)) {
            editor.setCursor ({line:curr.line - 1, ch:text.length - 0});
            curr = editor.getCursor ('head');
            text = editor.getLine (curr.line);
        }

        editor.setCursor ({line:curr.line - 0, ch:text.length - 0});
        editor.focus ();
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    insert_hyperlink: function (button) {
        var editor = assert (this.get_editor (button));

        var insertLinkBox = Ext.create ('Webed.window.InsertLinkBox', {
            scope: this, callback: callback, label: editor.getSelection ()
        });

        function callback (url, label) {
            editor.replaceSelection ((label)
                ? String.format ('[{0}]({1})', label, url) : url);
        }

        insertLinkBox.on ('destroy', function () { editor.focus (); });
        insertLinkBox.show ();
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    insert_horizontal_line: function (button) {
        var editor = assert (this.get_editor (button));
        var rest = '\n----\n';
        var cur = editor.getCursor ();
        var txt = editor.getLine (cur.line);

        rest = this.fix_preceeding_whitespace (editor, rest, txt, cur);
        rest = this.fix_succeeding_whitespace (editor, rest, txt, cur);

        editor.replaceSelection (rest);
        editor.setCursor (editor.getCursor ());
        editor.focus ();
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    fix_preceeding_whitespace: function (editor, rest, text, cursor) {

        if (cursor.ch > 0 && !text.match (/^\s+$/)) {
            rest = '\n' + rest;
        } else {
            var prev_txt = editor.getLine (cursor.line - 1);
            if (prev_txt == '' || (prev_txt && prev_txt.match (/^\s+$/))) {
                rest = rest.replace (/^\n/, '');
            }

            if (text.match (/^\s+$/)) editor.setLine (cursor.line, '');
        }

        return rest;
    },

    fix_succeeding_whitespace: function (editor, rest, text, cursor) {

        if (cursor.ch < text.length) {
            rest += '\n'
        } else {
            var next_txt = editor.getLine (cursor.line + 1);
            if (next_txt == '' || (next_txt && next_txt.match (/^\s+$/))) {
                rest = rest.replace (/\n$/, '');
            }
        }

        return rest;
    }
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

Ext.define ('Webed.controller.toolbar.MarkdownToolbar.KeyMap', {
    extend: 'Ext.util.KeyMap',

    refs: [{
        selector: 'tab-manager[focused=true]', ref: 'tabManager'
    }],

    config: {
        target: Ext.getDoc (),
        toolbar: null
    },

    constructor: function (config) {
        this.callParent (arguments);
        this.initConfig (config);
    },

    binding: [{
        key: Ext.EventObject.B,
        ctrl: true,
        defaultEventAction: 'stopEvent',
        handler: function () {
            var toolbar = assert (this.getToolbar ());
            var tab_manager = toolbar.up ('tab-manager[focused=true]');
            if (tab_manager) {
                var button = toolbar.down ('button[action=toggle-strong]');
                assert (button).fireEvent ('click', button);
            }
        }
    },{
        key: Ext.EventObject.I,
        ctrl: true,
        defaultEventAction: 'stopEvent',
        handler: function () {
            var toolbar = assert (this.getToolbar ());
            var tab_manager = toolbar.up ('tab-manager[focused=true]');
            if (tab_manager) {
                var button = toolbar.down ('button[action=toggle-italic]');
                assert (button).fireEvent ('click', button);
            }
        }
    },{
        key: Ext.EventObject.L,
        ctrl: true,
        defaultEventAction: 'stopEvent',
        handler: function () {
            var toolbar = assert (this.getToolbar ());
            var tab_manager = toolbar.up ('tab-manager[focused=true]');
            if (tab_manager) {
                var button = toolbar.down ('button[action=toggle-literal]');
                assert (button).fireEvent ('click', button);
            }
        }
    }]
});
