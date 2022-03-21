import React from 'react';
import { Link } from '../../renderer/Link';

export { Page };

export const initialRevalidateSeconds = 15;

function Page(props: { d: string }) {
  return (
    <>
      <h1>Welcome</h1>
      This page is:
      <ul>
        <li>Catch-all /catch-all routes</li>
        <li>ISR for some pages:</li>
        <ul>
          <li>
            <Link href="/catch-all/a/b/c">/catch-all/a/b/c</Link>
          </li>
          <li>
            <Link href="/catch-all/a/d">/catch-all/a/d</Link>
          </li>
        </ul>
        <li>All other pages are dynamic, e.g.:</li>
        <ul>
          <li>
            <Link href="/catch-all/a">/catch-all/a</Link>
          </li>
          <li>
            <Link href="/catch-all/d">/catch-all/d</Link>
          </li>
          <li>
            <Link href="/catch-all/e/f/g/h/i">/catch-all/e/f/g/h/i</Link>
          </li>
        </ul>
        <li>{props.d}</li>
      </ul>
    </>
  );
}
