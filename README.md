# social-media-backend

Autentificare cu JWT cu localstorage(sau cookies)

Field-uri pentru:
@USER -> id, name, email, password, posts, photos, friends
@POST -> id, user(user-ul caruia ii corespunde post-ul), date, description
@COMMENT -> id, user, postId, numberOfLikes, comment sau description
@NOTIFICATIONS -> id, data(momentul in care s-a primit notificarea), mesajul notificarii

Metode pentru:
@USER -> register user, login user, logout user
@POST -> create post, remove post, update post, getPost, getPosts
@COMMENT -> getComment, getComments, createComment, remove comment, update comment
@NOTIFICATION -> getNotifications, create notification, delete notification, update(probabil mark as read)
....
