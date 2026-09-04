from odoo import fields, models

# Hardcoded user types. The list is fixed so that the Point of Sale and the
# commission rules can key off a stable code instead of a record name.
CONTACT_TYPE_SELECTION = [
    ('retail', 'Retail'),
    ('commission', 'Commission'),
    ('mass_wholesale', 'Mass Wholesale'),
    ('readymade_wholesale', 'Readymade Wholesale'),
    ('stitching_wholesale', 'Stitching Wholesale'),
]


class ContactType(models.Model):
    _name = 'contact.type'
    _description = 'Contact Type'
    _order = 'sequence, name'

    name = fields.Char(string='Name', required=True, translate=True)
    type = fields.Selection(
        CONTACT_TYPE_SELECTION, string='User Type',
        help="User type this contact type stands for. The Point of Sale and the "
             "commission rules match on this code, so leaving it empty "
             "keeps the type out of those rules.")
    sequence = fields.Integer(string='Sequence', default=10)
    active = fields.Boolean(string='Active', default=True)
