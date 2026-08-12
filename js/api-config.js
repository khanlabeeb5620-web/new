/* =========================================================
   API ADDRESS
   -----------------------------------------------------------
   Leave this as an empty string ('') for the normal local setup
   described in GUIDE.md, where the admin panel and the server
   that saves your changes run on the same computer.

   This file is only used by the admin panel (admin/admin.js) to
   know where to send save requests. The storefront pages
   (index/product/about/contact.html) don't fetch anything at
   all — their content is baked directly into js/products-data.js
   and js/site-config.js by the server every time you save
   something in the admin panel. So this file has no effect on
   what visitors see; it only matters while you're using /admin/.

   You would only ever change this if you set up the optional
   "admin panel works live on the internet" configuration
   described at the end of GUIDE.md — most people never need to.
   ========================================================= */

const API_BASE = '';
