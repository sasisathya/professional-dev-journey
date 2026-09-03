// Builder Pattern - Separates construction of complex object from representation allowing step-by-step construction
// Use case: Creating complex objects, configuration builders, query builders, document builders

class SQLQueryBuilder {
  constructor() {
    this.query = {
      select: [],
      from: '',
      joins: [],
      where: [],
      groupBy: [],
      having: [],
      orderBy: [],
      limit: null,
      offset: null
    };
  }

  select(...columns) {
    if (columns.length === 0) {
      this.query.select = ['*'];
    } else {
      this.query.select.push(...columns);
    }
    return this;
  }

  from(table, alias = null) {
    this.query.from = alias ? `${table} AS ${alias}` : table;
    return this;
  }

  innerJoin(table, condition) {
    this.query.joins.push({ type: 'INNER JOIN', table, condition });
    return this;
  }

  leftJoin(table, condition) {
    this.query.joins.push({ type: 'LEFT JOIN', table, condition });
    return this;
  }

  rightJoin(table, condition) {
    this.query.joins.push({ type: 'RIGHT JOIN', table, condition });
    return this;
  }

  where(condition) {
    this.query.where.push(condition);
    return this;
  }

  and(condition) {
    this.query.where.push(`AND ${condition}`);
    return this;
  }

  or(condition) {
    this.query.where.push(`OR ${condition}`);
    return this;
  }

  groupBy(...columns) {
    this.query.groupBy.push(...columns);
    return this;
  }

  having(condition) {
    this.query.having.push(condition);
    return this;
  }

  orderBy(column, direction = 'ASC') {
    this.query.orderBy.push(`${column} ${direction}`);
    return this;
  }

  limit(count) {
    this.query.limit = count;
    return this;
  }

  offset(count) {
    this.query.offset = count;
    return this;
  }

  build() {
    let sql = `SELECT ${this.query.select.join(', ')} FROM ${this.query.from}`;

    if (this.query.joins.length > 0) {
      sql += ' ' + this.query.joins.map(j => `${j.type} ${j.table} ON ${j.condition}`).join(' ');
    }

    if (this.query.where.length > 0) {
      sql += ' WHERE ' + this.query.where.join(' ');
    }

    if (this.query.groupBy.length > 0) {
      sql += ' GROUP BY ' + this.query.groupBy.join(', ');
    }

    if (this.query.having.length > 0) {
      sql += ' HAVING ' + this.query.having.join(' AND ');
    }

    if (this.query.orderBy.length > 0) {
      sql += ' ORDER BY ' + this.query.orderBy.join(', ');
    }

    if (this.query.limit !== null) {
      sql += ` LIMIT ${this.query.limit}`;
    }

    if (this.query.offset !== null) {
      sql += ` OFFSET ${this.query.offset}`;
    }

    return sql;
  }

  reset() {
    this.query = {
      select: [],
      from: '',
      joins: [],
      where: [],
      groupBy: [],
      having: [],
      orderBy: [],
      limit: null,
      offset: null
    };
    return this;
  }
}

class HttpRequestBuilder {
  constructor() {
    this.request = {
      method: 'GET',
      url: '',
      headers: {},
      body: null,
      timeout: 5000,
      retries: 0,
      auth: null
    };
  }

  method(method) {
    this.request.method = method.toUpperCase();
    return this;
  }

  url(url) {
    this.request.url = url;
    return this;
  }

  header(key, value) {
    this.request.headers[key] = value;
    return this;
  }

  headers(headers) {
    this.request.headers = { ...this.request.headers, ...headers };
    return this;
  }

  body(body) {
    this.request.body = body;
    if (typeof body === 'object') {
      this.request.headers['Content-Type'] = 'application/json';
    }
    return this;
  }

  timeout(ms) {
    this.request.timeout = ms;
    return this;
  }

  retries(count) {
    this.request.retries = count;
    return this;
  }

  basicAuth(username, password) {
    const encoded = Buffer.from(`${username}:${password}`).toString('base64');
    this.request.auth = `Basic ${encoded}`;
    this.request.headers['Authorization'] = this.request.auth;
    return this;
  }

  bearerToken(token) {
    this.request.auth = `Bearer ${token}`;
    this.request.headers['Authorization'] = this.request.auth;
    return this;
  }

  build() {
    if (!this.request.url) {
      throw new Error('URL is required');
    }

    return {
      ...this.request,
      body: typeof this.request.body === 'object' ? JSON.stringify(this.request.body) : this.request.body
    };
  }

  reset() {
    this.request = {
      method: 'GET',
      url: '',
      headers: {},
      body: null,
      timeout: 5000,
      retries: 0,
      auth: null
    };
    return this;
  }
}

class DocumentBuilder {
  constructor() {
    this.document = {
      title: '',
      author: '',
      content: [],
      metadata: {},
      formatting: {}
    };
  }

  title(title) {
    this.document.title = title;
    return this;
  }

  author(author) {
    this.document.author = author;
    return this;
  }

  addParagraph(text) {
    this.document.content.push({ type: 'paragraph', text });
    return this;
  }

  addHeading(text, level = 1) {
    this.document.content.push({ type: 'heading', level, text });
    return this;
  }

  addList(items, ordered = false) {
    this.document.content.push({ type: 'list', ordered, items });
    return this;
  }

  addImage(src, alt, width = 'auto', height = 'auto') {
    this.document.content.push({ type: 'image', src, alt, width, height });
    return this;
  }

  addTable(headers, rows) {
    this.document.content.push({ type: 'table', headers, rows });
    return this;
  }

  setMetadata(key, value) {
    this.document.metadata[key] = value;
    return this;
  }

  setFormatting(key, value) {
    this.document.formatting[key] = value;
    return this;
  }

  build() {
    return this.document;
  }

  buildHtml() {
    let html = `<!DOCTYPE html>
<html>
<head>
  <title>${this.document.title}</title>
  <meta charset="UTF-8">
</head>
<body>
  <header>
    <h1>${this.document.title}</h1>
    ${this.document.author ? `<p>By ${this.document.author}</p>` : ''}
  </header>
  <main>`;

    this.document.content.forEach(item => {
      switch (item.type) {
        case 'paragraph':
          html += `\n    <p>${item.text}</p>`;
          break;
        case 'heading':
          html += `\n    <h${item.level}>${item.text}</h${item.level}>`;
          break;
        case 'list':
          const listTag = item.ordered ? 'ol' : 'ul';
          html += `\n    <${listTag}>`;
          item.items.forEach(i => {
            html += `\n      <li>${i}</li>`;
          });
          html += `\n    </${listTag}>`;
          break;
        case 'image':
          html += `\n    <img src="${item.src}" alt="${item.alt}" width="${item.width}" height="${item.height}">`;
          break;
        case 'table':
          html += `\n    <table border="1">\n      <thead>\n        <tr>`;
          item.headers.forEach(h => {
            html += `\n          <th>${h}</th>`;
          });
          html += `\n        </tr>\n      </thead>\n      <tbody>`;
          item.rows.forEach(row => {
            html += `\n        <tr>`;
            row.forEach(cell => {
              html += `\n          <td>${cell}</td>`;
            });
            html += `\n        </tr>`;
          });
          html += `\n      </tbody>\n    </table>`;
          break;
      }
    });

    html += `\n  </main>\n</body>\n</html>`;
    return html;
  }
}

// Usage Examples
console.log('========== SQL QUERY BUILDER ==========\n');

const sqlBuilder = new SQLQueryBuilder();
const query1 = sqlBuilder
  .select('users.id', 'users.name', 'users.email', 'COUNT(orders.id) as order_count')
  .from('users')
  .leftJoin('orders', 'users.id = orders.user_id')
  .where('users.status = "active"')
  .and('users.created_at > "2024-01-01"')
  .groupBy('users.id', 'users.name', 'users.email')
  .having('COUNT(orders.id) > 0')
  .orderBy('order_count', 'DESC')
  .limit(10)
  .build();

console.log('Query 1:');
console.log(query1);
console.log('\n');

sqlBuilder.reset();
const query2 = sqlBuilder
  .select('id', 'name', 'salary')
  .from('employees', 'e')
  .where('e.department = "Sales"')
  .and('e.salary > 50000')
  .orderBy('e.salary', 'DESC')
  .build();

console.log('Query 2:');
console.log(query2);

console.log('\n\n========== HTTP REQUEST BUILDER ==========\n');

const httpBuilder = new HttpRequestBuilder();
const getRequest = httpBuilder
  .method('GET')
  .url('https://api.example.com/users/123')
  .header('Accept', 'application/json')
  .bearerToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  .timeout(10000)
  .retries(3)
  .build();

console.log('GET Request:');
console.log(JSON.stringify(getRequest, null, 2));
console.log('\n');

httpBuilder.reset();
const postRequest = httpBuilder
  .method('POST')
  .url('https://api.example.com/users')
  .header('Accept', 'application/json')
  .body({ name: 'John Doe', email: 'john@example.com', role: 'admin' })
  .basicAuth('admin', 'password123')
  .timeout(5000)
  .build();

console.log('POST Request:');
console.log(JSON.stringify(postRequest, null, 2));

console.log('\n\n========== DOCUMENT BUILDER ==========\n');

const docBuilder = new DocumentBuilder();
const document = docBuilder
  .title('Technical Report: Design Patterns')
  .author('Jane Smith')
  .addHeading('Introduction', 1)
  .addParagraph('This report covers the most important design patterns in software development.')
  .addHeading('Patterns Covered', 2)
  .addList(['Singleton Pattern', 'Factory Pattern', 'Observer Pattern', 'Strategy Pattern'], true)
  .addHeading('Key Benefits', 2)
  .addList(['Improved code reusability', 'Better maintainability', 'Enhanced flexibility'], false)
  .addTable(['Pattern', 'Use Case', 'Complexity'], [
    ['Singleton', 'Single instance management', 'Low'],
    ['Factory', 'Object creation', 'Medium'],
    ['Observer', 'Event handling', 'Medium']
  ])
  .setMetadata('version', '1.0')
  .setMetadata('date', '2024-01-15')
  .build();

console.log('Document Object:');
console.log(JSON.stringify(document, null, 2));

console.log('\n\nGenerated HTML (First 500 chars):');
const html = docBuilder.buildHtml();
console.log(html.substring(0, 500) + '...');
