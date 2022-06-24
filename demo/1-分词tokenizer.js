import esprima from "esprima";
import estraverse from "estraverse-fb";
// jsx
const sourceCode = `
  <div id="title"><span>hello</span>world</div>
`;
const ast = esprima.parseModule(sourceCode, {
  // 源代码是jsx
  jsx: true,
  // 支持打印token
  tokens: true,
});
// console.info(ast);
let ident = 0;
function padding() {
  return " ".repeat(ident);
}
// 转换
// 第二个参数对象 也就是visitor访问器
estraverse.traverse(ast, {
  // 进入
  enter(node) {
    console.log(padding() + node.type + "进入");
    ident += 2;
  },
  // 离开
  leave(node) {
    console.log(padding() + node.type + "离开");
    ident -= 2;
  },
});

/** 得到的tokens
    esprima内部要得到抽象语法树，需要经过两步
      1. 把源代码进行分词，得到一个tokens的数组，如下
      2. token数组转为抽象语法树
  tokens: [
    { type: 'Punctuator', value: '<' },
    { type: 'JSXIdentifier', value: 'div' },
    { type: 'JSXIdentifier', value: 'id' },
    { type: 'Punctuator', value: '=' },
    { type: 'String', value: '"title"' },
    { type: 'Punctuator', value: '>' },
    { type: 'Punctuator', value: '<' },
    { type: 'JSXIdentifier', value: 'span' },
    { type: 'Punctuator', value: '>' },
    { type: 'JSXText', value: 'hello' },
    { type: 'Punctuator', value: '<' },
    { type: 'Punctuator', value: '/' },
    { type: 'JSXIdentifier', value: 'span' },
    { type: 'Punctuator', value: '>' },
    { type: 'JSXText', value: 'world' },
    { type: 'Punctuator', value: '<' },
    { type: 'Punctuator', value: '/' },
    { type: 'JSXIdentifier', value: 'div' },
    { type: 'Punctuator', value: '>' }
  ]

*/
