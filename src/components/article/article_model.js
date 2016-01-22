import Model from "../../core/model";

export default class ArticleModel extends Model {
  parse(response) {
    return response.article;
  }
};
