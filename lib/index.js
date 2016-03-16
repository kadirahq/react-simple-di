import React from 'react';
import hoistStatics from 'hoist-non-react-statics';

const getDisplayName = Component => (
  Component.displayName || Component.name || 'Component'
);

export function injectDeps(context, _actions) {
  const actions = {};
  for (let key in _actions) {
    if (_actions.hasOwnProperty(key)) {
      const actionMap = _actions[key];
      const newActionMap = {};
      for (let actionName in actionMap) {
        if (actionMap.hasOwnProperty(actionName)) {
          newActionMap[actionName] = actionMap[actionName].bind(null, context);
        }
      }
      actions[key] = newActionMap;
    }
  }

  return function (Component) {
    const ComponentWithDeps = React.createClass({
      childContextTypes: {
        context: React.PropTypes.object,
        actions: React.PropTypes.object
      },

      getChildContext() {
        return {
          context,
          actions
        };
      },

      render() {
        return (<Component {...this.props} />);
      }
    });

    ComponentWithDeps.displayName = `WithDeps(${getDisplayName(Component)})`;
    return hoistStatics(ComponentWithDeps, Component);
  };
}

const defaultMapper = (context, actions) => ({
  context: () => context,
  actions: () => actions
});

export function useDeps(mapper = defaultMapper) {
  return function (Component) {
    const ComponentUseDeps = React.createClass({
      render() {
        const {context, actions} = this.context;
        const mappedProps = mapper(context, actions);

        const newProps = {
          ...this.props,
          ...mappedProps
        };

        return (<Component {...newProps} />);
      },

      contextTypes: {
        context: React.PropTypes.object,
        actions: React.PropTypes.object
      }
    });

    ComponentUseDeps.displayName = `UseDeps(${getDisplayName(Component)})`;
    return hoistStatics(ComponentUseDeps, Component);
  };
}
