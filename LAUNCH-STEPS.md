# Launching on tristone.ae

The redesigned website and owner CMS are prepared on the existing Site. `tristone.ae` is already attached to that Site, but the latest provider check still reports pending DNS/SSL validation. Do not describe the domain as live yet.

In Hostinger, open your domain's DNS Zone Editor. The existing Sites domain record requires:

| Type | Host/name | Value |
| --- | --- | --- |
| A | @ | 162.159.143.30 |
| A | @ | 172.66.3.26 |
| TXT | _openai-site-verification | openai-site-verification=_x3fJ34Tl1kymJvU-AeipePZ-8NAUIJJN4VeP9Mx6Ps |
| TXT | _cf-custom-hostname | ea7a763a-e4fb-4a94-8c2b-b165c03b468c |

These values came from the already attached domain's native Sites response. Do not replace email MX, SPF, DKIM or unrelated DNS records. Review conflicting website A/AAAA records with your host before replacing them. Once saved, tell me so I can recheck verification, set the public canonical origin and help finish the public launch. The current Site remains owner-private; DNS verification alone does not make it public.

## Website editor

Open the website's **Website admin** footer link. Sign in with the ChatGPT account that owns the Site. Choose Home, Services, About, Careers, Contact, Company details, Trust points or Privacy policy. Edit and click **Save changes**. Replace photos by uploading JPG/PNG images. Keep the contact phone blank until you are ready to display it.

## Separate forms

Customer and candidate forms are built, validated and tested with simulated Google storage. Real submissions remain disabled until the company Google backend and Turnstile are authorised/configured. Follow `google-drive-setup/START-HERE.md`; after connection we must verify an actual enquiry row/upload and a separate candidate row/CV before claiming live intake.
