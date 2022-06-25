# 编译原理的学习

## 1. 需求分析

1. 实现JSX语法转JS语法的一个编译器
2. 需求：将一段JSX语法的代码，生成一个AST，并支持遍历和修改这个AST，将AST重新生成JS语法的代码

## 2. 编译器工作流

- 解析（Parsing）：解析是将最初原始的代码转换为一种更加抽象的表示（即AST）
- 转换（Transformation）：转换是对这个抽象的表示（AST）做一些处理，让它能够做到编译器期望它做到的事情
- 代码生成（Code Generation）：接收处理之后的代码表示，然后把它转换为其他新的代码

### 2.1 解析

解析一般来说分为两个阶段：也就是我们熟知的词法分析(Lexical Analysis) 和语法分析(Syntactic Analysis)

- 词法分析：接收原始代码，然后把它分割成一些被称为`token`的东西，这个过程是在词法分析器（Tokenizer或者Lexer）中完成的
- Token是一个数组，由一些代码语句的碎片组成。他们可以是数字，标签，标点符号，运算符或者其他的任何可表示的
- 语法分析：接收之前生成的token，把他们转换成一种抽象的表示，这种抽象的表示描述了代码语句中的每一个片段以及它们之间的关系。这被称为中间表示（Intermediate representation）或 抽象语法树（Abstract Syntax Tree，简称AST）
- 抽象语法树是一个嵌套程度很深的对象，用一种更容易处理的方式代表了代码本身，也能给我们更多信息

### 2.2 遍历（Traversal）

- 为了能处理所有的节点，我们需要遍历他们，使用的是深度优先遍历
- 对于上面的AST的遍历流程是这样的

#### 使用编译器esprima

为了方便展示结果，这里我们可以先使用esprima工具看看编译生成的token结果

**源代码：**

```html
<div id="title"><span>hello</span>world</div>
```

**使用方式：**

![image-20220624203753601](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220624203753601.png)

```js
import esprima from "esprima";
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
console.info(ast);
```

**tokens**:

***得到的tokens***

  *esprima内部要得到抽象语法树，需要经过两步*：

1. 把源代码进行分词，得到一个tokens的数组，如下

2. token数组转为抽象语法树

```js
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
```

Punctuator就是表示这是一个符号，JSXIdentifier表示这是一个标识符，String表示这是一个字符串，JSXText表示这个一个jsx文本

### 安装解析包

```shell
pnpm i estraverse estraverse-fb -D
```

因为需要解析jsx，需要使用带fb这个包（就是facebook）。

**接下来我们就可以遍历ast了**

上面，我们已经生成了ast，接下来就可以遍历这个树。

![image-20220624205521453](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220624205521453.png)

```js
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
```

![image-20220624205428536](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220624205428536.png)

### 2.3 转换（Transformation）

- 编译器的下一步就是转换，它只是把AST拿过来然后对它做一些修改，它可以在同种语言下操作AST，也可以把AST翻译成全新的语言
- 或许你看出来了，我们的AST中有很多相似的元素，这些元素都有type属性，他们被称为AST节点。这些节点含有若干属性，可以用于描述AST的部分信息
- 当转换AST的时候我们可以添加，移动，替换这些节点，也可以根据现有的AST生成全新的AST
- 既然我们编译器的目标是把输入的代码转换为一直新的语言，所以我们将会着重于产生一个针对新语言的全新的AST

### 2.4 代码生成

- 编译器的最后一个节点是代码生成，这个阶段做的时候有时候会和转换重叠，但是代码生成最重要的部分还是根据AST来输出代码
- 代码生成有几种不同的方式，有些编译器将会重用之前生成的token，有些会创建独立的代码表示，以便于线性的输出代码。但是接下来我们还是着重于使用之前生成好的AST
- 我们的代码生成器需要知道如何打印AST中所有的类型的节点，然后它会递归的调用自身，知道所有的代码都被打印到一个很长的字符串中

## 有限状态机

- 每一个状态都是一个机器，每个机器都可以接收输入和计算输出
- 机器本身没有状态，每一个机器会根据输入决定下一个状态

#### 有限状态机的原理

这里我们模拟一下有限状态机的实现：对 `10+20`进行一下分词

```js
/*
 * @Author: 毛毛
 * @Date: 2022-06-24 21:17:49
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-24 21:56:51
 */
// 分词
/**
 * 使用状态机实现
 */
const tokens = [];
const NUMBERS = /\d/;
// 数字类型
const Numeric = "Numeric";
// 标识符号 + -
const Punctuator = "Punctuator";
// 当前token
let currentToken;
/**
 * 确定一个新的token了
 * @param {*} token
 */
function emit(token) {
  currentToken = null;
  tokens.push(token);
}
/**
 * start函数 表示开始状态函数
 * 它是一个函数 接收一个字符 返回下一个状态函数
 * @param {*} char
 */
function start(char) {
  // char=1
  if (NUMBERS.test(char)) {
    // char是数字 生成一个新token
    currentToken = {
      type: Numeric,
      value: "",
    };
  }
  // 进入新的状态了 什么状态》？ 就是收集或者是捕获number数字的状态
  return number(char);
}

function number(char) {
  // char是数字
  if (NUMBERS.test(char)) {
    // char是数字 生成一个新token
    currentToken.value += char;
    // 表示在收集number类型 下一个类型还是数字 继续进入 不是数字则走else
    return number;
  } else if (char === "+" || char === "-") {
    // 是 +
    // 表示上一个token收集完毕了
    emit(currentToken);
    // 将当前token也收集
    emit({ type: Punctuator, value: char });
    currentToken = { type: Numeric, value: "" };
    return number;
  }
}

function tokenizer(input) {
  let state = start;
  for (const char of input) {
    state = state(char);
  }
  // 可能还有最后一个token没有收集
  if (currentToken?.value.length) {
    emit(currentToken);
  }
}

tokenizer("10+20");
console.log(tokens);
/**
[
  { type: 'Numeric', value: '10' },
  { type: 'Punctuator', value: '+' },
  { type: 'Numeric', value: '20' }
]
*/
```



## 4. 实现编译器

### 4.1 词法分析器

我们只是结束代码组成的字符串，然后把他们分割成`token`组成的数组

**token**的类型这里就简单点，只是写一个简单的词法分析，实现很简单的一个小玩意

```js
export const LeftParentheses = "LeftParentheses"; // <
export const RightParentheses = "RightParentheses"; // >
export const JSXIdentifier = "JSXIdentifier"; // div
export const JSXText = "JSXText"; // hello
export const Equator = "Equator"; // =
export const BackSlash = "BackSlash"; // /
export const AttributeKey = "AttributeKey"; // 属性的key id name
export const AttributeStringValue = "AttributeStringValue";
export const AttributeExpressionValue = "AttributeStringValue"; // 表达式 {n}
```

词法分析的开始，就是tokenizer：

![image-20220625101437320](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220625101437320.png)

我们会根据当前的字符，来进行下一个状态的切换，进以不同的状态收集不同的字符。其原理就类似于一大堆的`if else`分支，不断循环的判断。

```js
/*
 * @Author: 毛毛
 * @Date: 2022-06-25 08:39:16
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-25 10:10:06
 */
import {
  LeftParentheses,
  RightParentheses,
  Equator,
  BackSlash,
  AttributeStringValue,
  JSXIdentifier,
  AttributeKey,
  JSXText,
  AttributeExpressionValue,
} from "./tokenTypes.js";
// 分词
const Letters = /[a-zA-Z0-9]/;

let currentToken = { type: "", value: "" };
const tokens = [];
/**
 * 收集 token
 * 一旦发射了一个token过来 就需要清空一下当前的token，因为已经收集到了，可以进行下一次收集
 * @param {*} token
 */
function emit(token) {
  tokens.push(token);
  currentToken = null;
}

/**
 * 分词开始
 * @param {*} char
 */
function start(char) {
  if (char === "<") {
    emit({ type: LeftParentheses, value: "<" });
    // 现在是左括号状态 所以我们返回一个找到左括号的状态
    return foundLeftParentheses;
  }
  throw new Error("第一个字符必须是 <");
}
/**
 * 找打左括号 那么当前接收的字符 必须是元素了 也就是标识符
 * @param {*} char
 */
function foundLeftParentheses(char) {
  // char= d i  v
  if (Letters.test(char)) {
    // char是字母 匹配到了标识符
    currentToken = { type: JSXIdentifier, value: char };
    // 返回继续收集标识符的状态
    return jSXIdentifier;
  }
  if (char === "/") {
    // 到当前标签结束位置了
    emit({ type: BackSlash, value: char });
    // 进入收集 左括号的状态
    return foundLeftParentheses;
  }
}
/**
 * 找右括号
 * @param {*} char
 */
function foundRightParentheses(char) {
  if (char === "<") {
    emit({ type: LeftParentheses, value: "<" });
    // 进入收集左括号的状态
    return foundLeftParentheses;
  }
  // jsx文本
  currentToken = { type: JSXText, value: char };
  // 进入收集文本的状态
  return jsxTest;
}

function jsxTest(char) {
  if (char === "<") {
    // 文本标识符 收集结束
    emit(currentToken);
    emit({ type: LeftParentheses, value: "<" });
    // 找到小括号状态
    return foundLeftParentheses;
  }
  currentToken.value += char;
  return jsxTest;
}

/**
 * 收集属性
 */
function attribute(char) {
  // char=i d
  if (Letters.test(char)) {
    // 收集属性了
    currentToken = { type: AttributeKey, value: char };
    // 是属性就开始收集了 然后进入属性id的状态
    return attributeKey;
  }
  return new Error("属性 key 错误");
}
/**
 * 收集属性id状态
 * @param {*} char
 */
function attributeKey(char) {
  if (Letters.test(char)) {
    currentToken.value += char;
    // 继续收集属性的key状态
    return attributeKey;
  } else if (char === "=") {
    // 遇到 = 表示收集key结束 发射当前token
    emit(currentToken);
    emit({ type: Equator, value: char });
    // 进入属性值的收集
    return attributeValue;
  }
}

function attributeValue(char) {
  if (char === '"') {
    // 遇到 双引号了 收集属性值
    currentToken = { type: AttributeStringValue, value: '"' };
    // 开始收集字符串属性值的状态
    return attributeStringValue;
  }
  // 属性表达式的收集
  if (char === "{") {
    currentToken = { type: AttributeExpressionValue, value: char };
    return attributeExpressionValue;
  }
}
/**
 * 收集属性表达式状态
 * @param {*} char
 */
function attributeExpressionValue(char) {
  if (char === " " || Letters.test(char)) {
    currentToken.value += char;
    return attributeExpressionValue;
  }
  if (char === "}") {
    currentToken.value += char;
    emit(currentToken);
    return tryLeaveAttribute;
  }
}
/**
 * 收集字符串属性值
 * @param {*} char
 */
function attributeStringValue(char) {
  // char=t i t l e
  if (Letters.test(char)) {
    currentToken.value += char;
    return attributeStringValue;
  } else if (char === '"') {
    // 遇到双引号 表示值收集结束了
    currentToken.value += char;
    emit(currentToken);
    // 下一个状态 可能是空格以后 继续收集属性 因为一个元素可以有多个属性
    // 也可能是属性收集完毕了 下一个状态就是 > 表示离开了属性
    // 所以下一个状态就是尝试离开属性的状态
    return tryLeaveAttribute;
  }
}
/**
 * 下一个状态可能还是收集属性 也可能是开始标签的结束了
 * @param {*} char
 */
function tryLeaveAttribute(char) {
  if (char === " ") {
    return attribute; // 继续收集属性
  }
  if (char === ">") {
    // 开始标签的结束 不需要收集属性了
    // 发射当前的 >
    emit({ type: RightParentheses, value: ">" });
    // 表示一个标签的开始标签收集完毕了
    // 下一个状态 找右括号
    return foundRightParentheses;
  }
}

/**
 * 收集标识符
 * @param {*} char
 */
function jSXIdentifier(char) {
  if (Letters.test(char)) {
    // 如果还是字母或者数字  依然还是标识符的一部分
    currentToken.value += char;
    return jSXIdentifier;
  }
  if (char === " ") {
    // 收集标识符的过程中 遇到空格了  表示标识符到现在结束了
    // 发射当前收集到的token 忽略空格 因为不是有意义的
    emit(currentToken);
    // 进行下一个状态的收集 也就是属性
    return attribute;
  }
  if (char === ">") {
    // 来到开始标签的闭合状态  也就是没有属性
    emit(currentToken);
    emit({ type: RightParentheses, value: char });
    // 进入收集到右括号的状态了
    return foundRightParentheses;
  }
}

/**
 * 分词 生成tokens
 * @param {*} input
 */
function tokenizer(input) {
  // 刚开始处于开始状态
  let state = start;
  for (const char of input) {
    // 循环所有字符 全部遍历一遍
    if (state) state = state(char);
  }
  return tokens;
}

const sourceCode = `<div id="title" name={name}><span>hello</span>world</div>`;

console.log(tokenizer(sourceCode));

export default tokenizer;
```



## 5. 语法分析

- 语法分析的原理和递归下降算法（Recursive Descent Parsing）
- 了解什么是上下文无关法（Contex-free Grammer CFG）

### 5.1 递归下降算法

- 它左边是一个非终结符（Non-terminal）

- 右边是它的产生式（Production Rule）
- 在语法解析的过程中，左边会被右边替代。如果替代之后还有非终结符，那么继续替代这个过程，知道最后全部都是终结符（Terminal），也就是token
- 只有终结符才可以成为AST的叶子节点，这个过程，也叫推导（Derivation）过程
- 上级文法嵌套下级文法，上级的算法调用下级的算法。表现在生成AST中，上级算法生成上级节点，下级算法生成下级节点。这就是下降的含义

### 5.2 上下文无关法

- 上下文无关的意思是，无论在任何情况下，文法的推导规则是一样的
- 规则分为两级，第一级是加法规则，第二级就是乘法规则。把乘法规则作为加分规则的子规则
- 解析形成AST时，乘法节点就一定是加法节点的子节点，从而被优先计算
- 加法规则中还递归的又引用了加法规则
- 也就是说含义是明确的，不会有歧义性

### 5.3 算术表达式

```js
2+3*4
```



