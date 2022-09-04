/*
 * @Author: 毛毛
 * @Date: 2022-06-24 21:17:49
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-09-04 10:45:19
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
  // 刚开始的时候是start状态
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
