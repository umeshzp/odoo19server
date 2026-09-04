from odoo import fields, models


class ResPartner(models.Model):
    _inherit = 'res.partner'

    contact_type_ids = fields.Many2many(
        'contact.type', 'res_partner_contact_type_rel', 'partner_id', 'type_id',
        string='Contact Types')

    commission_rate = fields.Float(string='Commission Rate (%)',
        help='Custom commission rate for this commission partner. Leave 0 to use default rate from POS config.')

    tin_number = fields.Char(string='TIN Number')
    mobile = fields.Char(string='Mobile')
