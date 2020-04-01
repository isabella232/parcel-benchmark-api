import { NowRequest, NowResponse } from '@now/node';
import { query } from 'faunadb';

import faunaClient from './utils/fauna-client';

const PAGE_COUNT = 40;

function stringifyQuery(queryparam: string | Array<string>): string {
  if (Array.isArray(queryparam)) {
    queryparam = queryparam.join('');
  }

  return queryparam.trim();
}

export default async function handleGet(req: NowRequest, res: NowResponse) {
  let id = req.query.id && stringifyQuery(req.query.id);
  let after = req.query.after && stringifyQuery(req.query.after);
  let before = req.query.before && stringifyQuery(req.query.before);

  if (id) {
    // Return comparisons for id
    try {
      let faunaRes: any = await faunaClient.query(query.Get(query.Ref(query.Collection('comparisons'), id)));

      res.statusCode = 200;
      res.end(
        JSON.stringify({
          type: 'error',
          data: {
            id,
            ...faunaRes.data
          }
        })
      );
    } catch (e) {
      res.statusCode = 404;
      res.end(
        JSON.stringify({
          type: 'error',
          data: {
            code: 'not_found'
          }
        })
      );
    }
  } else {
    let paginationOptions: any = {
      size: PAGE_COUNT
    };

    if (before) {
      paginationOptions.before = [query.Ref(query.Collection('comparisons'), before)];
    }

    if (after) {
      paginationOptions.after = [query.Ref(query.Collection('comparisons'), after)];
    }

    // Return last x comparisons
    let faunaRes: any = await faunaClient.query(
      query.Map(
        query.Paginate(query.Match(query.Index('comparisons_reverse_sorted_createdAt')), paginationOptions),
        query.Lambda(['createdAt', 'ref'], query.Get(query.Var('ref')))
      )
    );

    let next = null;
    let previous = null;

    if (faunaRes.after && faunaRes.after.length) {
      next = typeof faunaRes.after[0] === 'number' ? faunaRes.after[0] : faunaRes.after[0].id;
    }

    if (faunaRes.before && faunaRes.before.length) {
      previous = typeof faunaRes.before[0] === 'number' ? faunaRes.before[0] : faunaRes.before[0].id;
    }

    res.end(
      JSON.stringify({
        type: 'success',
        data: faunaRes.data.map((doc: any) => {
          return {
            id: doc.ref.id,
            ...doc.data
          };
        }),
        count: faunaRes.data.length,
        next: next,
        previous: previous
      })
    );
  }
}
