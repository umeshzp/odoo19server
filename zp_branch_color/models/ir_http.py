# -*- coding: utf-8 -*-
from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = 'ir.http'

    def session_info(self):
        """Ship each company's navbar colour with the session.

        The web client already carries the company list; adding the colour there
        means the navbar is painted on the first frame, with no extra request and
        no flash of the default purple.
        """
        session_info = super().session_info()
        user_companies = session_info.get('user_companies')
        if not user_companies:
            return session_info

        company_ids = [
            *user_companies.get('allowed_companies', {}),
            *user_companies.get('disallowed_ancestor_companies', {}),
        ]
        # sudo: the session already exposes these companies to the user.
        colors = {
            company.id: company._get_navbar_color()
            for company in self.env['res.company'].sudo().browse(company_ids)
        }
        for key in ('allowed_companies', 'disallowed_ancestor_companies'):
            for company_id, company_info in user_companies.get(key, {}).items():
                company_info['navbar_color'] = colors.get(company_id)
        return session_info
