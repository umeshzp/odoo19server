# -*- coding: utf-8 -*-
{
    'name': 'Branch Colour Bar',
    'summary': 'Tint the backend navbar with the colour of the active branch',
    'description': """
Gives every company/branch its own navbar colour so a user can tell at a glance
which branch they are working in, on every screen of the backend.
""",
    'version': '19.0.1.0.0',
    'sequence': 0,
    'author': 'Zeropoint Pvt. Ltd.',
    'website': 'https://zeropoint.hr/',
    'category': 'Technical',
    'license': 'LGPL-3',
    'depends': ['web'],
    'data': [
        'views/res_company_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'zp_branch_color/static/src/branch_color/branch_color.scss',
            'zp_branch_color/static/src/branch_color/branch_color_service.js',
        ],
    },
    'installable': True,
    'auto_install': False,
}
