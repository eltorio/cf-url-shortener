/*
Copyright © Eltorio - Ronan Le Meillat
This file is part of cf-url-shortener <https://github.com/chiditarod/cf-url-shortener>.
This project was built with the help of 
Matthew Mascioni who wrote a usefull tutorial https://dev.to/mmascioni/build-a-link-shortener-with-cloudflare-workers-1j3i (no license using public domain)
And https://github.com/signalnerve/workers-auth0-example MIT license

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

import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import { authorize, logout, handleRedirect } from './auth0'
import { hydrateState } from './edge_state';
import { router } from './shortener';



/*
async function handleEvent(event) {
  let requestUrl = new URL(event.request.url);
  if (requestUrl.pathname === '/' || requestUrl.pathname.includes('static')) {
    return await getAssetFromKV(event);
  } else {
    return await router.handle(event.request);
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleEvent(event));
});
*/

addEventListener('fetch', event => event.respondWith(handleRequest(event)))

// see the readme for more info on what these config options do!
const config = {
  // opt into automatic authorization state hydration
  hydrateState: true,
  // return responses at the edge
  originless: true,
}

async function handleRequest(event) {
  const url = new URL(event.request.url)

  try {
    if ( (url.pathname === '/') || (url.pathname === '/auth') || ( url.pathname.startsWith( '/logout' )) || ( url.pathname.startsWith( '/shortener' )))
    {
      let request = event.request

      const [authorized, { authorization, redirectUrl }] = await authorize(event)
      if (authorized && authorization.accessToken) {
        request = new Request(request, {
          headers: {
            Authorization: `Bearer ${authorization.accessToken}`,
          },
        })
      }

      let response = config.originless
        ? new Response(null)
        : await fetch(event.request)

      if (url.pathname === '/auth') {
        const authorizedResponse = await handleRedirect(event)
        if (!authorizedResponse) {
          return new Response('Unauthorized', { status: 401 })
        }
        response = new Response(response.body, {
          response,
          ...authorizedResponse,
        })
        return response
      }

      if (!authorized) {
        return Response.redirect(redirectUrl)
      }

      response = await getAssetFromKV(event)

      if (url.pathname === '/logout') {
        const { headers } = logout(event);
        return headers
          ?
          new Response(response.body, {
            ...response,
            headers: Object.assign({}, response.headers, headers),
          })
          //: Response.redirect('/shortener')
          : Response(response.headers);
      }

      // hydrate the static site with authorization info from auth0
      // this uses alpine.js and the htmlrewriter engine built into
      // workers. for more info, check out the README
      return config.hydrateState
        ? new HTMLRewriter()
          .on('script#edge_state', hydrateState(authorization.userInfo))
          .transform(response)
        : response
    } else {
      return await router.handle(event.request);
    }
  } catch (err) {
    return new Response(err.toString())
  }
}