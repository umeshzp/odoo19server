# -*- coding: utf-8 -*-
import re

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError

HEX_COLOR_RE = re.compile(r'^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$')


class ResCompany(models.Model):
    _inherit = 'res.company'

    navbar_color = fields.Char(string='Navigation bar')

    @api.constrains('navbar_color')
    def _check_navbar_color(self):
        for company in self:
            if company.navbar_color and not HEX_COLOR_RE.match(company.navbar_color):
                raise ValidationError(_(
                    "%(color)s is not a valid colour. Use a hexadecimal code "
                    "such as #714B67.", color=company.navbar_color))

    def _get_navbar_color(self):
        """The colour to paint the navbar with for this company.

        Returns the explicitly set colour, or False if none is configured.
        """
        self.ensure_one()
        return self.navbar_color or False

    def action_remove_navbar_color(self):
        """Back to Odoo's own navbar colour."""
        self.write({'navbar_color': False})
