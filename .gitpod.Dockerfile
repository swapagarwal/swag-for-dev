FROM gitpod/workspace-full

# Setup NVM
COPY .nvmrc $HOME
RUN bash -c "source $HOME/.nvm/nvm.sh && nvm install && nvm use"
