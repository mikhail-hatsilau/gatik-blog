import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import server from '../app';

import { User, Article } from '../schemas';

chai.use(chaiHttp);

const agent = chai.request.agent(server);

const getGraphqlBody = (query) => (
    {
        operationName: null,
        query,
        variables: ''
    }
);

describe('Routes', () => {
    const userCredentials = {
        username: 'vano',
        password: '123'
    };

    before((done) => {
        User.remove({}, () => {
            const user = new User({
                username: 'vano',
                password: '123',
                first_name: 'Ivan',
                last_name: 'Ivanych',
                role: 'admin'
            });
            user.save(() => {
                agent
                    .post('/login')
                    .send(userCredentials)
                    .end(() => done());
            });
        });
    });


    after((done) => {
        agent.post('/logout').end(() => {
            User.remove({}, () => done());
        });
    });

    describe('Authentication', () => {
        it('should login user and return session id', (done) => {
            agent.post('/logout').end(() => {
                agent
                    .post('/login')
                    .send(userCredentials)
                    .end((err, res) => {
                        expect(res.status).to.equal(200);
                        expect(res.body).to.have.property('sessionId');
                        done();
                    });
            });
        });

        it('should logout user and return proper message', (done) => {
            agent
                .post('/logout')
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body).to.have.property('message');
                    expect(res.body.message).to.equal('Logged out');

                    agent
                        .post('/login')
                        .send(userCredentials)
                        .end(() => done());
                });
        });

        it('should return error with proper message when username is incorrect', (done) => {
            agent.post('/logout').end(() => {
                agent
                    .post('/login')
                    .send({
                        username: 'unknown',
                        password: '123'
                    })
                    .end((err) => {
                        expect(err.status).to.equal(403);
                        expect(err.response.body).to.have.property('message');
                        expect(err.response.body.message).to.equal('Username is incorrect');

                        agent
                            .post('/login')
                            .send(userCredentials)
                            .end(() => done());
                    });
            });
        });

        it('should return error with proper message when password is incorrect', (done) => {
            agent.post('/logout').end(() => {
                agent
                    .post('/login')
                    .send({
                        username: 'vano',
                        password: 'wrongpass'
                    })
                    .end((err) => {
                        expect(err.status).to.equal(403);
                        expect(err.response.body).to.have.property('message');
                        expect(err.response.body.message).to.equal('Password is incorrect');

                        agent
                            .post('/login')
                            .send(userCredentials)
                            .end(() => done());
                    });
            });
        });
    });

    describe('Graphql', () => {
        describe('Users', () => {
            it('should retrieve all users', (done) => {
                const query = `{
                    users {
                        username
                        first_name
                        last_name
                        role
                    } 
                }`;

                agent
                    .post('/graphql')
                    .send(getGraphqlBody(query))
                    .end((err, res) => {
                        const { users } = res.body.data;

                        expect(res.status).to.equal(200);
                        expect(users).to.be.instanceOf(Array);
                        expect(users[0]).to.eql({
                            username: 'vano',
                            first_name: 'Ivan',
                            last_name: 'Ivanych',
                            role: 'admin'
                        });
                        done();
                    });
            });

            it('should get one user', (done) => {
                const query = `{
                    users(username: "vano") {
                        username
                    } 
                }`;

                agent
                    .post('/graphql')
                    .send(getGraphqlBody(query))
                    .end((err, res) => {
                        const { users } = res.body.data;

                        expect(res.status).to.equal(200);
                        expect(users).to.have.length(1);
                        expect(users[0]).to.eql({
                            username: 'vano'
                        });
                        done();
                    });
            });

            it('should add new user', (done) => {
                const query = `
                    mutation {
                        addUser(input: { username: "user", password: "321", first_name: "User", last_name: "Userovich", role: "user" }) {
                            changedUserEdge {
                                node {
                                    id
                                    username
                                    role
                                }
                            }
                        }
                    }
                `;

                agent
                    .post('/graphql')
                    .send(getGraphqlBody(query))
                    .end((err, res) => {
                        const { node } = res.body.data.addUser.changedUserEdge;

                        expect(res.status).to.equal(200);
                        expect(node).to.eql({
                            id: node.id,
                            username: 'user',
                            role: 'user'
                        });

                        User.remove({ _id: node.id }, () => {
                            done();
                        });
                    });
            });

            it('should update current user', (done) => {
                const user = new User({
                    username: 'user',
                    password: '123',
                    first_name: 'User',
                    last_name: 'Userovych',
                    role: 'user'
                });
                user.save((err, user) => {
                    const query = `
                        mutation {
                            updateUser(input: {id: "${user._id}", username: "newuser"}) {
                                changedUser {
                                    username
                                }
                            }
                        }
                    `;

                    agent
                        .post('/graphql')
                        .send(getGraphqlBody(query))
                        .end((err, res) => {
                            const { changedUser } = res.body.data.updateUser;

                            expect(res.status).to.equal(200);
                            expect(changedUser.username).to.equal('newuser');

                            User.remove({ _id: user._id }, () => {
                                done();
                            });
                        });
                });
            });

            it('should delete current user', (done) => {
                const user = new User({
                    username: 'user',
                    password: '123',
                    first_name: 'User',
                    last_name: 'Userovych',
                    role: 'user'
                });
                user.save((err, user) => {
                    const query = `
                        mutation {
                            deleteUser(input: {id: "${user._id}"}) {
                                ok
                            }
                        }
                    `;

                    agent
                        .post('/graphql')
                        .send(getGraphqlBody(query))
                        .end((err, res) => {
                            const { deleteUser } = res.body.data;

                            expect(res.status).to.equal(200);
                            expect(deleteUser.ok).to.be.true;

                            User.remove({ _id: user._id }, () => {
                                done();
                            });
                        });
                });
            });
        });

        describe('Articles', () => {
            let testArticle;
            before((done) => {
                Article.remove({}, () => {
                    const article = new Article({
                        title: 'test',
                        description: 'test description',
                        author: {
                            username: 'vano'
                        },
                        comments: [],
                        tags: ['js'],
                        post_date: new Date().toISOString()
                    });
                    article.save((err, article) => {
                        testArticle = article;
                        done();
                    });
                });
            });

            after((done) => {
                Article.remove({}, () => done());
            });

            it('should retrieve all articles', (done) => {
                const query = `{
                    articles {
                        title
                        description
                        author {
                            username
                        }
                        tags
                    } 
                }`;

                agent
                    .post('/graphql')
                    .send(getGraphqlBody(query))
                    .end((err, res) => {
                        const { articles } = res.body.data;

                        expect(res.status).to.equal(200);
                        expect(articles).to.be.instanceOf(Array);
                        expect(articles[0]).to.eql({
                            title: 'test',
                            description: 'test description',
                            author: {
                                username: 'vano'
                            },
                            tags: ['js']
                        });
                        done();
                    });
            });

            it('should get one article', (done) => {
                const query = `{
                    article(id: "${testArticle._id}") {
                        title
                        description
                        author {
                            username
                        }
                    } 
                }`;

                agent
                    .post('/graphql')
                    .send(getGraphqlBody(query))
                    .end((err, res) => {
                        const { article } = res.body.data;

                        expect(res.status).to.equal(200);
                        expect(article).to.eql({
                            title: 'test',
                            description: 'test description',
                            author: {
                                username: 'vano'
                            }
                        });
                        done();
                    });
            });

            it('should add new article', (done) => {
                const query = `
                    mutation {
                        addArticle(input: {
                            title: "new article",
                            description: "new test article",
                            author: { username: "vano" },
                            comments: [],
                            tags: ["js"],
                            post_date: "${new Date().toISOString()}"
                        }) {
                            changedArticleEdge {
                                node {
                                    id
                                    title
                                    description
                                    author {
                                        username
                                    }
                                }
                            }
                        }
                    }
                `;

                agent
                    .post('/graphql')
                    .send(getGraphqlBody(query))
                    .end((err, res) => {
                        const { node } = res.body.data.addArticle.changedArticleEdge;

                        expect(res.status).to.equal(200);
                        expect(node).to.eql({
                            id: node.id,
                            title: "new article",
                            description: "new test article",
                            author: { username: "vano" }
                        });

                        Article.remove({ _id: node.id }, () => {
                            done();
                        });
                    });
            });

            it('should update current article', (done) => {
                const query = `
                    mutation {
                        updateArticle(input: {id: "${testArticle._id}", title: "newtitle"}) {
                            changedArticle {
                                id
                                title
                            }
                        }
                    }
                `;

                agent
                    .post('/graphql')
                    .send(getGraphqlBody(query))
                    .end((err, res) => {
                        const { changedArticle } = res.body.data.updateArticle;

                        expect(res.status).to.equal(200);
                        expect(changedArticle.title).to.equal('newtitle');

                        Article.remove({ _id: changedArticle.id }, () => {
                            done();
                        });
                    });
            });

            it('should delete current article', (done) => {
                const newArticle = new Article({
                    title: 'new test',
                    description: 'test description',
                    author: {
                        username: 'vano'
                    },
                    comments: [],
                    tags: ['js'],
                    post_date: new Date().toISOString()
                });
                newArticle.save((err, article) => {
                    const query = `
                        mutation {
                            deleteArticle(input: {id: "${article._id}"}) {
                                ok
                            }
                        }
                    `;

                    agent
                        .post('/graphql')
                        .send(getGraphqlBody(query))
                        .end((err, res) => {
                            const { deleteArticle } = res.body.data;
                            expect(res.status).to.equal(200);
                            expect(deleteArticle.ok).to.be.true;

                            Article.remove({ _id: article._id }, () => {
                                done();
                            });
                        });
                });
            });
        });
    });
});