const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(401).json({ error }));
};

exports.getSauceById = (req, res, next) => {
    Sauce.findById(req.params.id)
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(401).json({ error }));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
            req.file.filename
        }`,
    });

    sauce
        .save()
        .then(() => res.status(201).json({ message: 'Sauce ajoutée' }))
        .catch(error => res.status(400).json({ error }));
};

exports.updateSauce = (req, res, next) => {
    // Initialisation de la sauce
    const sauceObject = req.file
        ? {
              ...JSON.parse(req.body.sauce),
              imageUrl: `${req.protocol}://${req.get('host')}/images/${
                  req.file.filename
              }`,
          }
        : { ...req.body };
    delete sauceObject._userId;

    /**
     * Update the Sauce
     */
    const callUpdateSauce = () => {
        Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
        )
            .then(() => res.status(200).json({ message: 'Sauce mise à jour' }))
            .catch(error => res.status(401).json({ error }));
    };

    // Vérification de la présence de la sauce et de l'autorité de l'utilisateur
    Sauce.findById(req.params.id)
        .then(sauce => {
            if (sauce.userId !== req.auth.userId) {
                res.status(403).json({
                    message: 'unauthorized request',
                });
            } else {
                // Suppression de l'ancienne image si l'image est mise à jour
                if (!!req.file) {
                    const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => callUpdateSauce());
                } else {
                    // update pour les cas d'absence de nouvelle image
                    callUpdateSauce();
                }
            }
        })
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findById(req.params.id)
        .then(sauce => {
            if (sauce.userId !== req.auth.userId) {
                res.status(403).json({
                    message: 'unauthorized request',
                });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() =>
                            res.status(200).json({ message: 'Sauce supprimée' })
                        )
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => res.status(500).json({ error }));
};

exports.evalSauce = (req, res, next) => {
    // Get the sauce
    Sauce.findById(req.params.id)
        .then(sauce => {
            // Récupération des éléments de like de l'objet sauce
            let likeUpdate = {
                likes: sauce.likes,
                dislikes: sauce.dislikes,
                usersLiked: sauce.usersLiked,
                usersDisliked: sauce.usersDisliked,
            };

            /**
             * Vérifie si l'utilisateur n'a pas donné son avis
             * L'utilisateur ne peut pas liker si il l'a déjà fait ou si il a disliké et réciproquement
             * @returns Boolean true si l'utilisateur n'a pas donné d'avis
             */
            const checkEvalUser = () => {
                return (
                    !sauce.usersLiked.some(
                        userId => userId === req.auth.userId
                    ) &&
                    !sauce.usersDisliked.some(
                        userId => userId === req.auth.userId
                    )
                );
            };

            switch (req.body.like) {
                // Like
                case 1:
                    if (checkEvalUser()) {
                        likeUpdate.likes = likeUpdate.likes + 1;
                        likeUpdate.usersLiked.push(req.auth.userId);
                    } else {
                        res.status(401).json({
                            message:
                                "L'utilisateur a fait une action non autorisée",
                        });
                    }
                    break;
                // Action Neutre
                case 0:
                    // Vérifie si l'utilisateur a liké ou disliké
                    if (
                        sauce.usersLiked.some(
                            userId => userId === req.auth.userId
                        )
                    ) {
                        // Dans le cas d'un like désactivé
                        likeUpdate.usersLiked.splice(
                            likeUpdate.usersLiked.indexOf(req.auth.userId),
                            1
                        );
                        likeUpdate.likes = likeUpdate.likes - 1;
                    } else if (
                        sauce.usersDisliked.some(
                            userId => userId === req.auth.userId
                        )
                    ) {
                        // Dans le cas d'un dislike désactivé
                        likeUpdate.usersDisliked.splice(
                            likeUpdate.usersDisliked.indexOf(req.auth.userId),
                            1
                        );
                        likeUpdate.dislikes = likeUpdate.dislikes - 1;
                    } else {
                        res.status(401).json({
                            message:
                                "L'utilisateur a fait une action non autorisée",
                        });
                    }
                    break;
                // Dislike
                case -1:
                    if (checkEvalUser()) {
                        likeUpdate.dislikes = likeUpdate.dislikes + 1;
                        likeUpdate.usersDisliked.push(req.auth.userId);
                    } else {
                        res.status(401).json({
                            message:
                                "L'utilisateur a fait une action non autorisée",
                        });
                    }
                    break;
                default:
                    res.status(401).json({
                        message:
                            "L'utilisateur a fait une action non autorisée",
                    });
                    break;
            }
            // Appliquer les changements
            Sauce.updateOne(
                { _id: req.params.id },
                {
                    ...sauce._doc,
                    likes: likeUpdate.likes,
                    dislikes: likeUpdate.dislikes,
                    usersLiked: likeUpdate.usersLiked,
                    usersDisliked: likeUpdate.usersDisliked,
                }
            )
                .then(() => res.status(200).json({ message: 'Sauce évaluée' }))
                .catch(error => res.status(401).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
    // Vérification de la présence de la sauce
};
