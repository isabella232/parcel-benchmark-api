import React from 'react';
import urlJoin from 'url-join';

import { ComparisonsDocument } from '../types/comparison';
import timeFormatter from '../utils/time-formatter';
import { REPO_NAME, REPO_OWNER } from '../constants';
import TimeDiff from './time-diff';
import Link from './link';
import Card from './card';

type Props = {
  comparison: ComparisonsDocument;
};

type TimeElementProps = {
  buildTime: number;
  buildTimeDiff: number;
};

function TimeElement(props: TimeElementProps) {
  let { buildTime, buildTimeDiff } = props;

  return (
    <span className="font-semibold text-gray-800">
      {buildTime < 0 ? (
        <span className="text-red-600">Failed</span>
      ) : (
        <>
          {timeFormatter(buildTime)} (<TimeDiff time={buildTime} timeDiff={buildTimeDiff} />)
        </>
      )}
    </span>
  );
}

export default function ComparisonsCard(props: Props) {
  let { comparison } = props;

  return (
    <Card className="my-4">
      <div className="flex justify-between mb-2 text-lg">
        <div>
          <Link href={`/benchmark/${comparison.id}`}>
            <h2 className="font-semibold">
              {comparison.branch} - {comparison.commit.substr(0, 8)}
            </h2>
          </Link>
          <span className="block text-sm capitalize text-blue-400">{comparison.repo}</span>
        </div>
        {comparison.issue && (
          <Link href={urlJoin('https://github.com/', REPO_OWNER, REPO_NAME, 'issues', comparison.issue.toString())}>
            PR #{comparison.issue}
          </Link>
        )}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto',
          gridColumnGap: '1rem',
          gridRowGap: '.25rem'
        }}
      >
        <span className="text-gray-600">Benchmark</span>
        <span className="text-gray-600">Cold</span>
        <span className="text-gray-600">Cached</span>
        {comparison.comparisons.map((comparison, i) => {
          return (
            <React.Fragment key={i}>
              <span className="capitalize">{comparison.name}</span>
              <TimeElement buildTime={comparison.cold.buildTime} buildTimeDiff={comparison.cold.buildTimeDiff} />
              <TimeElement buildTime={comparison.cached.buildTime} buildTimeDiff={comparison.cached.buildTimeDiff} />
            </React.Fragment>
          );
        })}
      </div>
    </Card>
  );
}
