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

/**
 * 意外标识符 比如 空格等 结束当前这一组的token收集 去到下一个状态
 */
//  function eof() {
//   if (currentToken.value.length) {
//     emit(currentToken);
//   }
// }
