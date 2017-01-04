/*
 * About.js - View
 * 
 * Displaying information about the wallet, website, developers, etc.
 */

 Ext.define('FW.view.About', {
    extend: 'Ext.Container',

    config: {
        id: 'aboutView',
        layout: 'vbox',
        scrollable: 'vertical',
        cls: 'fw-panel',
        items:[{
            xtype: 'fw-toptoolbar',
            title: 'About',
            menu: true
        },{
            xtype: 'container',
            margin: '0 5 0 5',
            items:[{
                xtype: 'image',
                src: 'resources/images/logo.png',
                height: '120px',
                margin: '10 0 10 0'
            },{
                xtype: 'container',
                margin: '10 0 5 0',
                html:'<p align="justify">Mobile and Web wallet supporting Bitcoin XCP & Coval.C Coval.R coming soon.</p>' +
                     '<p>This is not the officially hosted version of this wallet but is a representation of the Master Branch which is currently in development. </p>'
            },{
                margin: '10 0 0 0',
                html:'<div class="hook" data-page="view/About.js"></div><p align="justify"><b>Send a donation to support Circuits of Value hosting and development.</b></p>' + 
                     '<p align="justify">Circuits of Value is a self-funded, open source and community supported project. We appreciate any donations, and all donations go directly towards supporting future development.</p>'
            },{
                xtype: 'button',
                text: 'Make a Donation to Circuits of Value',
                iconCls: 'fa fa-btc',
                ui: 'confirm',
                margin: '5 0 5 0',
                handler: function(){
                    var me = Ext.getCmp('aboutView');
                    me.main.showTool('send', {
                        reset: true,
                        currency: 'BTC',
                        address: '19cCGRb5XLuuzoRvDLyRm888G8ank5WFyM'
                    });
                }
            },{
                xtype: 'container',
                layout: 'hbox',
                defaults: {
                    xtype: 'button',
                    ui: 'action',
                    flex: 1
                },
                items:[{
                    iconCls: 'fa fa-github',
                    text: 'Source Code',
                    handler: function(){
                        var me = Ext.getCmp('aboutView');
                        me.main.openUrl('https://github.com/DecentricCorp/coval.c-wallet');
                    }
                },{
                    iconCls: 'fa fa-info-circle',
                    text: 'http://cov.al',
                    margin: '0 0 0 5',
                    handler: function(){
                        var me = Ext.getCmp('aboutView');
                        me.main.openUrl('http://cov.al');
                    }
                }]
            }]
        }]
    },

    initialize: function(){
        var me = this;
        // Setup alias to main controller
        me.main = FW.app.getController('Main');
    }


});
