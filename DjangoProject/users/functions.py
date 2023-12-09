from . import models
def getUsers(start=0):
    users = models.NewUser.objects.all().filter(is_deleted=False).values()
    return users
