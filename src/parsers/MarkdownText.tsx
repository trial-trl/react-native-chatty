import React, { useContext } from 'react';
import { PropsContext } from '../Chatty';
import { IChatBubble } from '../types/Chatty.types';
import { loadMarkdownView } from '../utils/markdownView';

export type CodeBlockNode = {
  lang: string;
  content: string;
};

export type EmptyNode = {};

export type HeadingNode = {
  level: number;
  content: InlineNode;
};

export type ImageNode = {
  alt: string;
  target: string;
  title: string;
  width?: number;
  height?: number;
};

export type InlineContentNode = {
  content: InlineNode;
};

export type LinkNode = {
  content: Node;
  target: string;
  title?: string;
};

export type ListNode = {
  ordered: boolean;
  start: number;
  items: InlineNode[];
};

export type TableAlign = 'right' | 'center' | 'left' | null;

export type TableNode = {
  header: InlineNode[];
  align: TableAlign;
  cells: InlineNode[][];
};

export type TextNode = {
  content: string;
};

export type InlineNode =
  | EmptyNode
  | ImageNode
  | InlineContentNode
  | LinkNode
  | TextNode;

export type Node = {
  [prop: string]: any;
} & (InlineNode | CodeBlockNode | HeadingNode | ListNode | TableNode);

// Rules

export type RegexComponents = string[];
export type NestedParseFunction = (string: string, any: any) => Object;
export type ParseState = Object;

export type ParseFunction = (
  regex: RegexComponents,
  nested: NestedParseFunction,
  state: ParseState
) => any;

export type NodeKey = string;
export type OutputFunction = (node: Node, object: Object) => any;
export type RenderState = {
  key: string;
  onLinkPress?: (link: string) => void;
};
export type RenderStyle = Object;
export type RenderStyles = { [key: NodeKey]: RenderStyle };

export type RenderFunction = (
  node: Node,
  output: OutputFunction,
  state: RenderState,
  style: RenderStyle
) => any;

export type Rule = {
  order?: number;
  match?: (string: string, state: RenderState, prev: string[]) => RegExp;
  parse?: ParseFunction;
  render?: RenderFunction;
};
export type Rules = { [key: NodeKey]: Rule };

const RNMarkdownView = loadMarkdownView();

function _MarkdownText({ message }: Pick<IChatBubble, 'message'>) {
  const propsContext = useContext(PropsContext);

  return (
    <>
      {propsContext?.enableMarkdown && (
        <RNMarkdownView
          rules={propsContext?.markdownProps?.customRules}
          styles={{
            paragraph: {
              marginTop: 0,
              marginBottom: 0,
            },
            ...(propsContext?.markdownProps?.customStyle || {}),
          }}
        >
          {message?.text}
        </RNMarkdownView>
      )}
    </>
  );
}

export const MarkdownText = React.memo(_MarkdownText);
