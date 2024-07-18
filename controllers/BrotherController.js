const mongoose = require('mongoose');
const Brother = require('../models/BrotherModel.js');
const fs = require('fs');

const getallBrothers = async (req, res) => {
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const brothers = await Brother.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('members');

        const count = await Brother.countDocuments();

        res.render('allmembers', {
            brothers,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            limit: limit // Pass the limit to the template
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
}
const getUpdate = async (req,res)=>{
    const { id } = req.params;
    try {
        const brother = await Brother.findById(id);
        if (!brother) {
            return res.status(404).json({ error: 'No such brother' });
        }
        res.render('update', {brother})
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}
const getData = async (req, res) => {
    try {
        const brothers = await Brother.find();

        // Aggregate data for charts
        const ethnicityCounts = brothers.reduce((acc, brother) => {
            acc[brother.ethnicity] = (acc[brother.ethnicity] || 0) + 1;
            brother.members.forEach(member => {
                acc[member.ethnicity] = (acc[member.ethnicity] || 0) + 1;
            });
            return acc;
        }, {});

        const genderCounts = brothers.reduce((acc, brother) => {
            if (brother.gender) {
                acc[brother.gender] = (acc[brother.gender] || 0) + 1;
            }
            brother.members.forEach(member => {
                if (member.gender) {
                    acc[member.gender] = (acc[member.gender] || 0) + 1;
                }
            });
            return acc;
        }, {});
        const statusCounts = brothers.reduce((acc, brother) => {
            if (brother.status) {
                acc[brother.status] = (acc[brother.status] || 0) + 1;
            }
            brother.members.forEach(member => {
                if (member.status) {
                    acc[member.status] = (acc[member.status] || 0) + 1;
                }
            });
            return acc;
        }, {});
        const ethnicityLabels = Object.keys(ethnicityCounts);
        const ethnicityData = Object.values(ethnicityCounts);

        const genderLabels = Object.keys(genderCounts);
        const genderData = Object.values(genderCounts);

        const statusLabels = Object.keys(statusCounts);
        const statusData = Object.values(statusCounts);

        res.render('data_analytics', {
            ethnicityLabels,
            ethnicityData,
            genderLabels,
            genderData,
            statusLabels ,
            statusData
        });
    } catch (err) {
        res.status(500).send(err);
    }
}



const getSearch = async (req, res) => {
    res.render('search');
}

const searchPeople = async (req, res) => {
    const { name } = req.query;
    try {
        const brothers = await Brother.find({ name: { $regex: name, $options: 'i' } });
        res.render('search-results', { brothers });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}

const getallRows = async (req, res) => {
    try {
        const brothers = await Brother.find({}).sort({ createdAt: -1 });
        const brotherWithNoCh = await Brother.find({ ch_name: 'မရှိ' });
        const brotherWithNoFirstCom = await Brother.find({ first_com: 'မရှိ' });
        const brotherWithNoSecondCom= await Brother.find({ second_com: 'မရှိ' });

    
        
        // Filter members with ch_name 'မရှိ' from each brother's members array
        const filteredMembers = [];
        brothers.forEach(brother => {
            const membersWithNoCh = brother.members.filter(member => member.ch_name === 'မရှိ');
            if (membersWithNoCh.length > 0) {
                filteredMembers.push({
                    brotherName: brother.name,
                    members: membersWithNoCh
                });
            }
        });

        // Filter members with second_com 'မရှိ' from each brother's members array
        const filteredMemberSecondCom = [];
        brothers.forEach(brother => {
            const membersWithNoSecondCom = brother.members.filter(member => member.second_com === 'မရှိ');
            if (membersWithNoSecondCom.length > 0) {
                filteredMemberSecondCom.push({
                    brotherName: brother.name,
                    members: membersWithNoSecondCom
                });
            }
        });
        const filteredMembersFirstCom = [];
        brothers.forEach(brother => {
            const membersWithNoFirstCom = brother.members.filter(member => member.first_com === 'မရှိ');
            if (membersWithNoFirstCom.length > 0) {
                filteredMembersFirstCom.push({
                    brotherName: brother.name,
                    members: membersWithNoFirstCom
                });
            }
        });

        const totalBrothers = brothers.length;
        let totalMembers = 0;
        brothers.forEach(brother => {
            totalMembers += brother.members.length;
        });

        res.render("admin_page", { brothers, totalBrothers, totalMembers,
             no_ch: filteredMembers, 
             brotherWithNoCh,
             brotherWithNoFirstCom,
             brotherWithNoSecondCom,
            no_sec_com:filteredMemberSecondCom, 
            no_first_com: filteredMembersFirstCom,
          });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



const getBrother = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such brother' });
    }
    try {
        const brother = await Brother.findById(id);
        if (!brother) {
            return res.status(404).json({ error: 'No such brother' });
        }
       res.render('people_details', {brother})
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createBrother = async (req, res) => {
    const { name, ch_name, birthdate, ethnicity, res_lead, baptism, first_com, second_com, gender, marriage, address, members } = req.body;
    const sample_image = 'dafault.jpg';
    const family_image = req.file ? req.file.filename : sample_image;
    

    try {
        // Calculate age for the brother
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // Determine status for the brother
        let status;
        if (age >= 35) {
            status = 'လူကြီး';
        } else if (age < 35 && age >= 13) {
            status = 'လူငယ်';
        } else {
            status = 'ကလေး';
        }

        // Prepare member objects with status and calculate age for each member
        const memberObjects = Array.isArray(members) ? members.map(member => {
            // Calculate age for each member
            const memberBirthDate = new Date(member.birthdate);
            let memberAge = today.getFullYear() - memberBirthDate.getFullYear();
            const memberMonthDiff = today.getMonth() - memberBirthDate.getMonth();

            if (memberMonthDiff < 0 || (memberMonthDiff === 0 && today.getDate() < memberBirthDate.getDate())) {
                memberAge--;
            }

            // Determine status for each member
            let memberStatus;
            if (memberAge >= 35) {
                memberStatus = 'လူကြီး';
            } else if (memberAge < 35 && memberAge >= 13) {
                memberStatus = 'လူငယ်';
            } else {
                memberStatus = 'ကလေး';
            }

            return {
                name: member.name,
                ch_name: member.ch_name,
                birthdate: member.birthdate,
                ethnicity: member.ethnicity,
                res_lead: member.res_lead,
                baptism: member.baptism,
                first_com: member.first_com,
                second_com: member.second_com,
                gender: member.gender,
                marriage: member.marriage,
                address: member.address,
                age: memberAge,  // Add age field for each member
                status: memberStatus  // Add status field for each member
            };
        }) : [];

        // Create brother document in database with calculated age and status
        const brother = await Brother.create({ 
            name, 
            ch_name, 
            birthdate, 
            ethnicity, 
            res_lead, 
            baptism, 
            first_com, 
            second_com, 
            gender, 
            marriage, 
            address, 
            family_image, 
            age,  // Add age field for brother
            status,  // Add status field for brother
            members: memberObjects 
        });

        req.flash('successMessage', 'သင့်အချက်လက်များကိုသိမ်းဆည်းပြီးပါပြီ');
        res.redirect('/home');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


const deleteBrother = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such brother' });
    }
    try {
        const brother = await Brother.findOneAndDelete({ _id: id });
        if (!brother) {
            return res.status(404).json({ error: 'No such brother' });
        }
        req.flash('successMessage', 'စာရင်းဖျက်ပြီးပါပြီ');
        res.redirect('/allmembers');
       
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateBrother = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such brother' });
    }

    try {
        // Define today's date
        const today = new Date();

        let brother = await Brother.findById(id);

        if (!brother) {
            return res.status(404).json({ error: 'No such brother' });
        }

        let updateData = { ...req.body };

        // Calculate age and determine status for the brother
        if (updateData.birthdate) {
            const birthDate = new Date(updateData.birthdate);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            // Determine status for the brother
            if (age >= 35) {
                updateData.status = 'လူကြီး';
            } else if (age < 35 && age >= 13) {
                updateData.status = 'လူငယ်';
            } else {
                updateData.status = 'ကလေး';
            }

            updateData.age = age;
        }

        // Calculate age and determine status for each member
        if (updateData.members && Array.isArray(updateData.members)) {
            updateData.members = updateData.members.map(member => {
                const memberBirthDate = new Date(member.birthdate);
                let memberAge = today.getFullYear() - memberBirthDate.getFullYear();
                const memberMonthDiff = today.getMonth() - memberBirthDate.getMonth();

                if (memberMonthDiff < 0 || (memberMonthDiff === 0 && today.getDate() < memberBirthDate.getDate())) {
                    memberAge--;
                }

                // Determine status for each member
                if (memberAge >= 35) {
                    member.status = 'လူကြီး';
                } else if (memberAge < 35 && memberAge >= 13) {
                    member.status = 'လူငယ်';
                } else {
                    member.status = 'ကလေး';
                }

                member.age = memberAge;
                return member;
            });
        }

        // Update brother document in database with calculated age and status
        if (req.file) {
            if (brother.family_image) {
                fs.unlinkSync(`uploads/${brother.family_image}`);
            }
            updateData.family_image = req.file.filename;
        }

        brother = await Brother.findOneAndUpdate({ _id: id }, updateData, { new: true });

        if (!brother) {
            return res.status(404).json({ error: 'No such brother' });
        }

        req.flash('successMessage', 'အောင်မြင်ပါသည်');
        res.redirect('/admin_page');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};




module.exports = {
    getallBrothers,
    getallRows,
    getBrother,
    getUpdate,
    createBrother,
    searchPeople,
    getSearch,
    deleteBrother,
    updateBrother,
    getData,
}
