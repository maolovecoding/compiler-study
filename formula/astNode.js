/*
 * @Author: 毛毛
 * @Date: 2022-06-26 09:03:51
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-26 09:08:08
 */

export default class ASTNode {
  constructor(type, value) {
    this.type = type; // 节点类型
    if (value) {
      this.value = value; // 节点的值
    }
  }
  /**
   * 给当前节点添加子节点
   * @param {*} childNode
   */
  appendChild(childNode) {
    (this.children || (this.children = [])).push(childNode);
  }
}
