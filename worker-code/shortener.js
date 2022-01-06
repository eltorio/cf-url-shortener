/*
Copyright © Eltorio - Ronan Le Meillat
This file is part of cf-url-shortener <https://github.com/chiditarod/cf-url-shortener>.
This project was built with the help of 
Matthew Mascioni who wrote a usefull tutorial https://dev.to/mmascioni/build-a-link-shortener-with-cloudflare-workers-1j3i

cf-url-shortener is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

cf-url-shortener is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with cf-url-shortener.  If not, see <http://www.gnu.org/licenses/>.
*/
import { Router } from 'itty-router';
import { customAlphabet } from 'nanoid';

export const router = Router();
const nanoid = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-',
  5,
);

router.get('/:slug', async request => {
    let req = request.params.slug;
    let link = await SHORTURL.get(req);
  
    if (link) {
      return new Response(null, {
        headers: { Location: link },
        status: 301,
      });
    }
    else if (req == 'copyright') {
      return new Response('© High Can Fly paragliding Club, see https://www.highcanfly.club', {
        headers: { 'content-type': 'text/plain' },
        status: 200,
      })
    }
    else {
      return new Response('Key not found', {
        status: 404,
      });
    }
  });
  
  router.post('/links', async request => {
    let slug = nanoid();
    let requestBody = await request.json();
    if (('url' in requestBody) && ('ttl' in requestBody)) {
      // Add slug to our KV store so it can be retrieved later:
      await SHORTURL.put(slug, requestBody.url, { expirationTtl: Number(requestBody.ttl) } );
      let shortenedURL = `${new URL(request.url).origin}/${slug}`;
      let responseBody = {
        message: 'Link shortened successfully',
        slug,
        shortened: shortenedURL,
      };
      return new Response(JSON.stringify(responseBody), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      });
    } else {
      return new Response("Must provide a valid URL", { status: 400 });
    }
  });
  