import Plan from './plan.model.js';

class PlanRepository {
  async findByName(name) {
    return Plan.findOne({ name });
  }

  async create(planData) {
    return Plan.create(planData);
  }

  async findAll(query = {}, sort = { price: 1 }) {
    return Plan.find(query).sort(sort);
  }

  async findByIdAndUpdate(id, updateData, options = { new: true, runValidators: true }) {
    return Plan.findByIdAndUpdate(id, { $set: updateData }, options);
  }

  async findById(id) {
    return Plan.findById(id);
  }
}

export default new PlanRepository();
