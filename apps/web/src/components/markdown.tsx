import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';

/**
 * Renders a question statement or editorial.
 *
 * A Server Component on purpose: the MDX is compiled on the server and only the resulting markup
 * crosses to the browser. That is also what lets the workspace withhold an editorial during a mock
 * session — the content is simply never rendered, rather than hidden with CSS.
 */
export function Markdown({ source }: { source: string }): React.ReactElement {
  return (
    <div className="prose-code-lift">
      <MDXRemote source={source} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
    </div>
  );
}
