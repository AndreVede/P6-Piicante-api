const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(401).json({ error }));
};

exports.getSauceById = (req, res, next) => {
    Sauce.findById({ _id: req.params.id })
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
        // Update de la sauce
        Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
        )
            .then(() => res.status(200).json({ message: 'Sauce mise à jour' }))
            .catch(error => res.status(401).json({ error }));
    };

    // Vérification de la présence de la sauce et de l'autorité de l'utilisateur
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId !== req.auth.userId) {
                res.status(401).json({
                    message: "L'utilisateur a fait une action non autorisée",
                });
            } else {
                // Suppression de l'ancienne image si l'image est mise à jour
                if (!!req.file) {
                    const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => {
                        callUpdateSauce();
                    });
                } else {
                    callUpdateSauce();
                }
            }
        })
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId !== req.auth.userId) {
                res.status(401).json({
                    message: "L'utilisateur a fait une action non autorisée",
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

exports.evalSauce = (req, res, next) => {};
