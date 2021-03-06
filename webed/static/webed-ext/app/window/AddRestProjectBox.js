Ext.define ('Webed.window.AddRestProjectBox', {
    extend: 'Ext.window.Window',
    alias: 'widget.add-rest-project-box',

    requires: [
        'Ext.grid.property.Grid'
    ],

    border: false,
    iconCls: 'icon-report_add-16',
    layout: 'fit',
    modal: true,
    resizable: false,
    title: 'Add Project',
    width: 360,

    config: {
        project: 'PROJECT',
        authors: 'AUTHORs',
        documentType: 'article',
        fontSize: '12pt',
        noColumns: 2,
        titleFlag: true,
        tocFlag: true,
        indexFlag: true,
        backend: 'xelatex'
    },

    items: [{
        xtype: 'propertygrid',
        sortableColumns: false,
        minHeight: 190,
        hideHeaders: true,
        source: {},

        listeners: {
            render: function (self) {
                self.customEditors = {
                    documentType: {
                        xtype: 'combo',
                        name: 'document',
                        allowBlank: false,
                        store: ['article', 'report'],
                        queryMode: 'local',
                        editable: false
                    },

                    fontSize: {
                        xtype: 'combo',
                        name: 'fontSize',
                        allowBlank: false,
                        store: ['10pt', '11pt', '12pt'],
                        queryMode: 'local',
                        editable: false
                    },

                    noColumns: {
                        xtype: 'combo',
                        name: 'noColumns',
                        allowBlank: false,
                        store: [1, 2],
                        queryMode: 'local',
                        editable: false
                    },

                    backend: {
                        xtype: 'combo',
                        name: 'backend',
                        allowBlank: false,
                        store: ['xelatex', 'pdflatex'],
                        queryMode: 'local',
                        editable: false
                    }
                }

                var width = assert (self.getWidth ());
                var column = assert (self.columns[0]);
                column.setWidth (width / 2.0);
            }
        },

        propertyNames: {
            project: 'Project',
            authors: 'Author(s)',
            documentType: 'Document Type',
            fontSize: 'Font Size',
            noColumns: 'Columns',
            titleFlag: 'Title',
            tocFlag: 'Table of Contents',
            indexFlag: 'Index',
            backend: 'Backend'
        }
    }],

    buttons: [{
        xtype: 'fieldcontainer',
        defaultType: 'checkboxfield',
        items: [{
            boxLabel: 'Enable GIT Versioning',
            name: 'vcs'
        }]
    },'->',{
        text: 'Confirm',
        iconCls: 'icon-tick-16',
        action: 'confirm'
    },{
        text: 'Cancel',
        iconCls: 'icon-cross-16',
        action: 'cancel'
    }]
});
