/*
 * @Author: 毛毛
 * @Date: 2022-06-26 08:26:48
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-09-12 10:59:23
 */
import {
  NUMBER,
  PLUS,
  MULTIPLE,
  MINUS,
  DIVIDE,
  LEFT_PARA,
  RIGHT_PARA,
} from "./tokenTypes.js";
const tokenNames = [
  NUMBER,
  PLUS,
  MULTIPLE,
  MINUS,
  DIVIDE,
  LEFT_PARA,
  RIGHT_PARA,
];
// 分词 使用正则语法
const RegExpObject = /(-?[0-9]+)|(\+)|(\*)|(-)|(\/)(\()(\))/g;
/**
 * 使用正则来进行分词
 * @param {*} script
 */
export default function tokenize(script) {
  const tokens = [];
  for (const token of tokenizer(script)) {
    tokens.push(token);
  }
  return new TokenReader(tokens);
}
/**
 * 生成 token
 * @param {*} script
 */
function* tokenizer(script) {
  let res;
  while (1) {
    // 匹配代码
    res = RegExpObject.exec(script);
    if (!res) break;
    // 这里拿到的是匹配项的索引
    const index = res.findIndex((item, index) => !!item && index > 0);
    // 第一项就是匹配的内容
    const token = { type: tokenNames[index - 1], value: res[0] };
    yield token;
  }
}
export class TokenReader {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0; // 索引
  }
  /**
   * 读取token 会消耗掉当前读取到的token，索引后移了
   */
  read() {
    if (this.pos < this.tokens.length) {
      return this.tokens[this.pos++];
    }
    return null;
  }
  /**
   * 查看当前索引的下一个token是什么，不会销毁掉下一个token
   */
  peek() {
    if (this.pos < this.tokens.length) {
      return this.tokens[this.pos];
    }
    return null;
  }
  /**
   * token多读 或者错读 回退
   */
  unread() {
    if (this.pos > 0) {
      this.pos--;
    }
  }
}
